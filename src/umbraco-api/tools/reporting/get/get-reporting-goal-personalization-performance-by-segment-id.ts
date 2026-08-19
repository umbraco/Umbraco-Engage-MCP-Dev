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

const inputSchema = z.object({ segmentId: z.number() });
const outputSchema = z.object({ items: getReportingGoalPersonalizationPerformanceBySegmentIdResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting-goal-personalization-performance-by-segment-id",
  description:
    "List the Umbraco Engage Reporting Goal Personalization Performance By Segment Id resource. Calls GET /umbraco/engage/management/api/v1/reporting/goal/personalization/performance/{segmentId}.",
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
