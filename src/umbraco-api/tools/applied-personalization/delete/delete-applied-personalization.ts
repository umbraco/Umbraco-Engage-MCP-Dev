import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteAppliedPersonalizationQueryParams } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteAppliedPersonalizationQueryParams;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-applied-personalization",
  description:
    "Delete the Umbraco Engage Applied Personalization resource. Calls DELETE /umbraco/engage/management/api/v1/applied-personalization.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteAppliedPersonalization(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
