import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAbTestPreviewUrlQueryParams, getAbTestPreviewUrlResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAbTestPreviewUrlQueryParams;
const outputSchema = getAbTestPreviewUrlResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-preview-url",
  description:
    "Get the Umbraco Engage Ab Test Preview Url resource. Calls GET /umbraco/engage/management/api/v1/ab-test/preview-url.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestPreviewUrl"]>, ApiClient>(
      (client) => client.getAbTestPreviewUrl(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
