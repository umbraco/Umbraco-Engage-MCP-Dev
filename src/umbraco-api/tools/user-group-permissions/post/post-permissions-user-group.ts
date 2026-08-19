import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postPermissionsUserGroupBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postPermissionsUserGroupBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-permissions-user-group",
  description:
    "Post the Umbraco Engage Permissions User Group resource. Calls POST /umbraco/engage/management/api/v1/permissions/user-group.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPermissionsUserGroup(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
