import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteAbTestQueryParams, deleteAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteAbTestQueryParams;
const outputSchema = deleteAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-ab-test",
  description:
    "Delete the Umbraco Engage Ab Test resource. Calls DELETE /umbraco/engage/management/api/v1/ab-test.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["deleteAbTest"]>, ApiClient>(
      (client) => client.deleteAbTest(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
