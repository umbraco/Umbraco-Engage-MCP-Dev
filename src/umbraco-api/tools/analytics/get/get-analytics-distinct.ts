import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAnalyticsDistinctQueryParams, getAnalyticsDistinctResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAnalyticsDistinctQueryParams;
const outputSchema = z.object({ items: getAnalyticsDistinctResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-analytics-distinct",
  description:
    "List the Umbraco Engage Analytics Distinct resource. Calls GET /umbraco/engage/management/api/v1/analytics/distinct.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getAnalyticsDistinct"]>, ApiClient>(
      (client) => client.getAnalyticsDistinct(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
