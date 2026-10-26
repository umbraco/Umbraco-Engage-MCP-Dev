import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestBody, postAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type {
  getUmbracoEngageManagementAPI,
  AbTestDetailModel,
} from "../../../api/generated/umbracoEngageManagementApi.js";
import { buildUmbracoPageVariants } from "./build-umbraco-page-variants.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAbTestBody>;

// The real API wants a full test entity (id/unique/audit fields/variant
// stubs/etc.) plus a large `indication` object it never actually needs
// populated (confirmed empirically - get-ab-test-empty's own draft posts
// successfully with indication: null). This schema exposes only the fields
// that carry real decision content; the handler synthesizes every
// mechanical id/uuid/timestamp/structural-stub field itself before making
// the same single POST call this tool always made - no extra API calls.
const inputSchema = z.object({
  name: z.string(),
  testType: z.enum(['SinglePage', 'MultiPage', 'ContentType', 'SplitUrl']),
  goalKey: z
    .uuid()
    .describe(
      "The `unique` guid of a real, active goal (from post-goal's response, or get-goal-details / post-goal-all). An unknown or inactive goal fails gracefully with validationResults.isValid=false and the error \"The selected goal should be active and valid\".",
    ),
  pageUnique: z
    .uuid()
    .describe(
      "The `unique` guid of the real, published Umbraco content page this test targets. For testType 'SplitUrl' this is specifically the benchmark 'Original' variant's page - the second variant redirects to `secondVariantPageUnique` instead.",
    ),
  secondVariantPageUnique: z
    .uuid()
    .nullish()
    .describe(
      "Required when testType is 'SplitUrl', and must differ from `pageUnique`: the real, published content page's unique guid the second (named) variant redirects visitors to. Must be omitted for SinglePage/MultiPage/ContentType tests, which show both variants on the same page(s) rather than redirecting to different URLs. A SplitUrl test needs two distinct pages, one per variant - omitting this produces the validation error 'At least two pages should be configured', and would otherwise leave the second variant with no page to redirect to.",
    ),
  projectKey: z
    .uuid()
    .nullish()
    .describe(
      "The `unique` guid of an existing A/B test project to group this test under (from post-ab-test-project's response or get-ab-test-project-all). Omitting it creates a real, valid test that is retrievable via get-ab-test-all/get-ab-test but will not appear when browsing via get-ab-test-project/get-ab-test-project-details for any project.",
    ),
  secondVariantName: z.string().default("Variant B"),
  participationPercentage: z.number().default(1),
  minimumDetectableEffect: z.number().default(0.1),
  estimatedDailyVisitors: z.number().default(0),
  baselineConversionRate: z.number().default(0.05),
});
const outputSchema = postAbTestResponse;

function buildVariant(
  isBenchmark: boolean,
  name: string,
  redirectNodeKey: string | null,
): FullBody["test"]["variants"][number] {
  return {
    id: 0,
    unique: randomUUID(),
    abTestId: 0,
    name,
    description: null,
    redirectNodeKey,
    css: null,
    javascript: null,
    created: new Date().toISOString(),
    createdByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
    isBenchmark,
    disabled: null,
    disabledByUmbracoUserKey: null,
    isDisabled: false,
    segment: null,
    previewSegment: null,
    totalPageviewsForVariant: 0,
    totalVisitorsForVariant: 0,
  };
}

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test",
  description:
    "Create a new A/B test in Draft status against a real content page, comparing an implicit 'Original' benchmark variant to one named second variant. `goalKey` must be the `unique` guid of a real, active goal - an unknown or inactive goal fails gracefully with validationResults.isValid=false. Pass `projectKey` to group the test under an existing A/B test project (see `projectKey`'s own description) - omitting it creates a real, valid test that will not appear when browsing by project. testType 'SplitUrl' additionally requires `secondVariantPageUnique` (see its own description) to give the second variant its own redirect page - passing it for any other testType, or omitting it for SplitUrl, is rejected with a validation error before any API call is made. The created test always starts in Draft status - this tool has no `startTime`/status field to set directly (Draft/Running/etc. is computed from timestamps, not settable at creation). Use post-ab-test-start afterwards to start or schedule it, and post-ab-test-stop to stop it.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const isSplitUrl = params.testType === "SplitUrl";
    const umbracoPageVariants = buildUmbracoPageVariants(
      params.testType,
      params.pageUnique,
      params.secondVariantPageUnique,
    );

    const now = new Date().toISOString();
    const body: FullBody = {
      test: {
        id: 0,
        unique: randomUUID(),
        created: now,
        projectKey: params.projectKey ?? null,
        goalKey: params.goalKey,
        status: "Draft",
        name: params.name,
        description: null,
        createdByUmbracoUserName: null,
        testType: params.testType,
        startTime: null,
        endTime: null,
        participationPercentage: params.participationPercentage,
        minimumDetectableEffect: params.minimumDetectableEffect,
        variants: [
          buildVariant(true, "Original", isSplitUrl ? params.pageUnique : null),
          buildVariant(
            false,
            params.secondVariantName,
            isSplitUrl ? (params.secondVariantPageUnique as string) : null,
          ),
        ],
        umbracoPageVariants,
        contentTypes: [],
        winner: null,
        isCompleted: false,
        completedOn: null,
        completedByUmbracoUserKey: null,
        stoppedByUmbracoUserKey: null,
        estimatedDailyVisitors: params.estimatedDailyVisitors,
        baselineConversionRate: params.baselineConversionRate,
        viableVisitorThreshold: null,
        previewNodeKey: null,
        // Required by Engage 18's model. Not exposed as an input: POST
        // /ab-test doesn't persist it (checked against 18.2.0 - a test saved
        // with 'Publish' or 'Draft' reads back as 'Nothing').
        onCompleteAction: "Nothing",
      },
      indication: null,
      variants: null,
      // Inversion is a property of the goal referenced by goalKey; this
      // request field is only echoed back in the response.
      isInvertedGoal: false,
    };
    // The zod-inferred body marks indication.status nullable where the
    // generated TS model (and the spec) don't; indication is always null here.
    return executeGetApiCall<ReturnType<ApiClient["postAbTest"]>, ApiClient>(
      (client) => client.postAbTest(body as AbTestDetailModel, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
