import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteAbTestProjectQueryParams } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteAbTestProjectQueryParams;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-ab-test-project",
  description:
    "Delete the Umbraco Engage Ab Test Project resource. Calls DELETE /umbraco/engage/management/api/v1/ab-test-project.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteAbTestProject(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
