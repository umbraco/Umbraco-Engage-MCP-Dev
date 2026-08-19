import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteAbTestVariantQueryParams } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteAbTestVariantQueryParams;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-ab-test-variant",
  description:
    "Delete the Umbraco Engage Ab Test Variant resource. Calls DELETE /umbraco/engage/management/api/v1/ab-test-variant.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteAbTestVariant(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
