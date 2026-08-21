import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getReportingResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `segmentId` optional, but the real API 400s
// when it's omitted entirely (confirmed empirically) - required here so
// callers get a clear schema error instead.
const inputSchema = z.object({
  segmentId: z.number().describe("The segment's numeric id (from get-segments-all), not its unique guid."),
});
const outputSchema = z.object({ items: getReportingResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting",
  description:
    "List goal-personalization performance rows (control group vs. personalized group completions/value) for a segment. Same response shape as get-reporting-goal-personalization-performance-by-segment-id - the functional difference between the two, if any, is undocumented upstream.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getReporting"]>, ApiClient>(
      (client) => client.getReporting(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
