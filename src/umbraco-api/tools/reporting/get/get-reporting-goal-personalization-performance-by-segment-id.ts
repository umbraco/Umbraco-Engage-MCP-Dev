import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getReportingGoalPersonalizationPerformanceBySegmentIdResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({
  segmentId: z.number().describe("The segment's numeric id (from get-segments-all), not its unique guid."),
});
const outputSchema = z.object({ items: getReportingGoalPersonalizationPerformanceBySegmentIdResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting-goal-personalization-performance-by-segment-id",
  description:
    "List goal-personalization performance rows (control group vs. personalized group completions/value) for a segment. Same response shape as get-reporting - the functional difference between the two, if any, is undocumented upstream.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getReportingGoalPersonalizationPerformanceBySegmentId"]>, ApiClient>(
      (client) => client.getReportingGoalPersonalizationPerformanceBySegmentId(params.segmentId, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
