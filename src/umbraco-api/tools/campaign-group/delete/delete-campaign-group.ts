import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteCampaignGroupQueryParams } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteCampaignGroupQueryParams;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-campaign-group",
  description:
    "Delete the Umbraco Engage Campaign Group resource. Calls DELETE /umbraco/engage/management/api/v1/campaign-group.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteCampaignGroup(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
