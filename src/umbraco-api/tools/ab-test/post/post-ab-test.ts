import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
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
  pageUnique: z.uuid().describe("The `unique` guid of the real, published Umbraco content page this test targets."),
  secondVariantName: z.string().default("Variant B"),
  participationPercentage: z.number().default(1),
  minimumDetectableEffect: z.number().default(0.1),
  estimatedDailyVisitors: z.number().default(0),
  baselineConversionRate: z.number().default(0.05),
});
const outputSchema = postAbTestResponse;

function buildVariant(isBenchmark: boolean, name: string): FullBody["test"]["variants"][number] {
  return {
    id: 0,
    unique: randomUUID(),
    abTestId: 0,
    name,
    description: null,
    redirectNodeKey: null,
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
    "Create a new A/B test in Draft status against a real content page, comparing an implicit 'Original' benchmark variant to one named second variant. `goalId` and `goal` are both required and must describe the SAME real, active goal (see their own descriptions for why): a real goal with a mismatched/invalid `goal` object fails gracefully with validationResults.isValid=false, but a `goalId` that doesn't correspond to ANY real goal fails as a raw 500 error (a database foreign-key violation, not a clean validation message) - always resolve `goalId` from a real goal (e.g. via get-goal-details) first. The created test starts in Draft status - no tool in this collection can move it to Running.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const now = new Date().toISOString();
    const body: FullBody = {
      test: {
        id: 0,
        unique: randomUUID(),
        created: now,
        projectId: null,
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
          buildVariant(true, "Original"),
          buildVariant(false, params.secondVariantName),
        ],
        umbracoPageVariants: [
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
