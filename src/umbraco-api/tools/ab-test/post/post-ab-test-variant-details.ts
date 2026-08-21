import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestVariantDetailsBody, postAbTestVariantDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAbTestVariantDetailsBody>;

// This endpoint is a pure, side-effect-free calculation - confirmed
// empirically (see post-ab-test-variant-details.test.ts) that feeding a
// real, persisted test's own data through it only echoes back
// goalValue/name/id/unique/segment differences, with no new computed
// behavior. It never needs a real goal or content page, so only the
// variant names are exposed here; everything else is synthesized as inert
// structural boilerplate matching get-ab-test-empty's own draft shape.
const inputSchema = z.object({
  testType: z.enum(['SinglePage', 'MultiPage', 'ContentType', 'SplitUrl']).default('SinglePage'),
  variantNames: z.array(z.string()).min(1).default(["Original", "Variant B"]),
});
const outputSchema = z.object({ items: postAbTestVariantDetailsResponse });

function buildVariant(index: number, name: string): FullBody["variants"][number] {
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
    isBenchmark: index === 0,
    disabled: null,
    disabledByUmbracoUserKey: null,
    isDisabled: false,
    segment: null,
    totalPageviewsForVariant: 0,
    totalVisitorsForVariant: 0,
  };
}

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-variant-details",
  description:
    "Compute per-variant statistics (conversion rate, goal completions, participant/visitor portions, etc.) for a set of named variants, the first of which is always treated as the benchmark. This is a pure calculation - it does not require or reference any real, persisted A/B test, goal, or content page, and every numeric statistic comes back zero since no real traffic data exists.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      unique: randomUUID(),
      created: new Date().toISOString(),
      projectId: null,
      goalId: null,
      status: "Draft",
      goal: null,
      name: null,
      description: null,
      createdByUmbracoUserName: null,
      testType: params.testType,
      startTime: null,
      endTime: null,
      participationPercentage: 1,
      minimumDetectableEffect: 0.1,
      variants: params.variantNames.map((name, i) => buildVariant(i, name)),
      umbracoPageVariants: [],
      contentTypes: [],
      winner: null,
      isCompleted: false,
      completedOn: null,
      completedByUmbracoUserKey: null,
      stoppedByUmbracoUserKey: null,
      estimatedDailyVisitors: 0,
      baselineConversionRate: 0.05,
      viableVisitorThreshold: null,
    };
    const result = await executeGetApiCall<ReturnType<ApiClient["postAbTestVariantDetails"]>, ApiClient>(
      (client) => client.postAbTestVariantDetails(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
