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
    "Get the Engage access-permissions entry for a document type by its `contentTypeId`. Unlike get-permissions-user-group, a contentTypeId with no stored entry does NOT error - it returns a synthetic default entry (id 0, all permission flags true) rather than a genuine stored record. Call this before post-permissions-document-type to check whether a real entry already exists (that tool is insert-only and creating a duplicate permanently breaks get-permissions-document-type-all) - a default (id 0) response means none exists yet.",
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
