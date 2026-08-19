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
    "Get the Umbraco Engage Campaign Group Visitors resource. Calls GET /umbraco/engage/management/api/v1/campaign-group/visitors.",
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
