import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getCampaignGroupVisitorsQueryParams, getCampaignGroupVisitorsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getCampaignGroupVisitorsQueryParams;
const outputSchema = getCampaignGroupVisitorsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-campaign-group-visitors",
  description:
    "Get visitor counts per campaign group over the last `amountOfDays` days (default period if omitted is not documented upstream). Response is a string-keyed map to visitor counts - the exact key semantics (campaign group name vs id) are unconfirmed, since this has only been observed returning an empty map on a test instance with no matching data.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getCampaignGroupVisitors"]>, ApiClient>(
      (client) => client.getCampaignGroupVisitors(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
