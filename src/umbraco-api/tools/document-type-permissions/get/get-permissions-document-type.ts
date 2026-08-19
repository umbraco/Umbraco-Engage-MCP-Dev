import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getPermissionsDocumentTypeQueryParams, getPermissionsDocumentTypeResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getPermissionsDocumentTypeQueryParams;
const outputSchema = getPermissionsDocumentTypeResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-permissions-document-type",
  description:
    "Get the Umbraco Engage Permissions Document Type resource. Calls GET /umbraco/engage/management/api/v1/permissions/document-type.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPermissionsDocumentType"]>, ApiClient>(
      (client) => client.getPermissionsDocumentType(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
