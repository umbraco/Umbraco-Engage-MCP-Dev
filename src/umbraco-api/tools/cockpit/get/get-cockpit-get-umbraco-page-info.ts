import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getCockpitGetUmbracoPageInfoQueryParams, getCockpitGetUmbracoPageInfoResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getCockpitGetUmbracoPageInfoQueryParams;
const outputSchema = getCockpitGetUmbracoPageInfoResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-cockpit-get-umbraco-page-info",
  description:
    "Get the Umbraco Engage Cockpit Get Umbraco Page Info resource. Calls GET /umbraco/engage/management/api/v1/cockpit/get-umbraco-page-info.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getCockpitGetUmbracoPageInfo"]>, ApiClient>(
      (client) => client.getCockpitGetUmbracoPageInfo(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
