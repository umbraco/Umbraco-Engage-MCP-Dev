import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getSuspiciousActivityOverviewQueryParams, getSuspiciousActivityOverviewResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getSuspiciousActivityOverviewQueryParams;
const outputSchema = getSuspiciousActivityOverviewResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-suspicious-activity-overview",
  description:
    "List visitors flagged with unusually high pageview counts (possible bots/scrapers), with their IP address and user agent. Supports `skip`/`take` pagination; use the response's `totalResults` to know when to stop paging.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getSuspiciousActivityOverview"]>, ApiClient>(
      (client) => client.getSuspiciousActivityOverview(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
