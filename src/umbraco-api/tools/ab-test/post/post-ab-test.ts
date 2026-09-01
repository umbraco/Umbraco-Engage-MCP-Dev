import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolValidationError,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestBody, postAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

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
  goalId: z.number().describe("The real goal's numeric id (from get-goal-details) - NOT its `unique` guid."),
  goal: z.object({
    key: z.uuid().describe("The same real goal's `unique` guid."),
    name: z.string().nullish(),
    value: z.number(),
    goalTypeId: z.uuid().describe("A real goal type id, from get-goal-all-types."),
    goalTypeConfig: z.string(),
    isMain: z.boolean().default(false),
    isInverted: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isInvalid: z.boolean().default(false),
  }).describe(
    "Must describe the SAME real, active goal as `goalId` - the server validates this object independently of a live lookup by `goalId`, so a mismatched goal here produces \"The selected goal should be active and valid\" even when `goalId` is correct.",
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
      "Required when testType is 'SplitUrl', and must differ from `pageUnique`: the real, published content page's unique guid the second (named) variant redirects visitors to. Must be omitted for SinglePage/MultiPage/ContentType tests, which show both variants on the same page(s) rather than redirecting to different URLs. Confirmed via decompiling the real Engage server (AbTestValidator.Validate -> requires UmbracoPageVariants.Count >= 2 for SplitUrl; AbTestSaveHandler.SetVariantNamesToNodeSegments -> matches each variant's redirectNodeKey to one of those pages) - a SplitUrl test built with only `pageUnique` fails validation with 'At least two pages should be configured', and even if that were bypassed, would have no variant actually pinned to a page to redirect to.",
    ),
  projectId: z
    .number()
    .nullish()
    .describe(
      "The numeric `id` (NOT `unique`) of an existing A/B test project to group this test under - from post-ab-test-project's or get-ab-test-project-all's own `id` field. Previously always sent as null: the test still saved and remained retrievable via get-ab-test-all/get-ab-test, but never appeared when browsing via get-ab-test-project/get-ab-test-project-details for any project (confirmed empirically - a project's `abTests`/counts are populated strictly by matching `projectId`), which is the likely cause of testers reporting created tests as 'invisible'.",
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
    totalPageviewsForVariant: 0,
    totalVisitorsForVariant: 0,
  };
}

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test",
  description:
    "Create a new A/B test in Draft status against a real content page, comparing an implicit 'Original' benchmark variant to one named second variant. `goalId` and `goal` are both required and must describe the SAME real, active goal (see their own descriptions for why): a real goal with a mismatched/invalid `goal` object fails gracefully with validationResults.isValid=false, but a `goalId` that doesn't correspond to ANY real goal fails as a raw 500 error (a database foreign-key violation, not a clean validation message) - always resolve `goalId` from a real goal (e.g. via get-goal-details) first. Pass `projectId` to group the test under an existing A/B test project (see `projectId`'s own description) - omitting it creates a real, valid test that will not appear when browsing by project. testType 'SplitUrl' additionally requires `secondVariantPageUnique` (see its own description) to give the second variant its own redirect page - passing it for any other testType, or omitting it for SplitUrl, is rejected with a validation error before any API call is made. The created test starts in Draft status - no tool in this collection can move it to Running.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const isSplitUrl = params.testType === "SplitUrl";
    if (isSplitUrl && !params.secondVariantPageUnique) {
      throw new ToolValidationError({
        title: "secondVariantPageUnique is required for testType SplitUrl",
        status: 400,
        detail:
          "testType 'SplitUrl' requires `secondVariantPageUnique` to give the second variant its own redirect page - the real server requires at least two pages configured for a SplitUrl test.",
      });
    }
    if (!isSplitUrl && params.secondVariantPageUnique) {
      throw new ToolValidationError({
        title: "secondVariantPageUnique is only valid for testType SplitUrl",
        status: 400,
        detail: `secondVariantPageUnique was provided but testType is '${params.testType}', which shows both variants on the same page(s) rather than redirecting - remove secondVariantPageUnique or set testType to 'SplitUrl'.`,
      });
    }
    if (isSplitUrl && params.secondVariantPageUnique === params.pageUnique) {
      throw new ToolValidationError({
        title: "secondVariantPageUnique must differ from pageUnique",
        status: 400,
        detail:
          "A SplitUrl test's two variants must redirect to two different pages - pageUnique and secondVariantPageUnique were the same guid.",
      });
    }

    const now = new Date().toISOString();
    const body: FullBody = {
      test: {
        id: 0,
        unique: randomUUID(),
        created: now,
        projectId: params.projectId ?? null,
        goalId: params.goalId,
        status: "Draft",
        goal: {
          id: params.goalId,
          key: params.goal.key,
          name: params.goal.name ?? null,
          value: params.goal.value,
          goalTypeId: params.goal.goalTypeId,
          goalTypeConfig: params.goal.goalTypeConfig,
          isMain: params.goal.isMain,
          isInverted: params.goal.isInverted,
          isActive: params.goal.isActive,
          isInvalid: params.goal.isInvalid,
          created: now,
          createdBy: randomUUID(),
          updated: null,
          updatedBy: null,
        },
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
        umbracoPageVariants: isSplitUrl
          ? [
              {
                id: 0,
                unique: params.pageUnique,
                nodeName: null,
                culture: null,
                abTestId: null,
                variesBySegment: false,
              },
              {
                id: 0,
                unique: params.secondVariantPageUnique as string,
                nodeName: null,
                culture: null,
                abTestId: null,
                variesBySegment: false,
              },
            ]
          : [
              {
                id: 0,
                unique: params.pageUnique,
                nodeName: null,
                culture: null,
                abTestId: null,
                variesBySegment: false,
              },
            ],
        contentTypes: [],
        winner: null,
        isCompleted: false,
        completedOn: null,
        completedByUmbracoUserKey: null,
        stoppedByUmbracoUserKey: null,
        estimatedDailyVisitors: params.estimatedDailyVisitors,
        baselineConversionRate: params.baselineConversionRate,
        viableVisitorThreshold: null,
      },
      indication: null,
      variants: null,
      isInvertedGoal: params.goal.isInverted,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAbTest"]>, ApiClient>(
      (client) => client.postAbTest(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
