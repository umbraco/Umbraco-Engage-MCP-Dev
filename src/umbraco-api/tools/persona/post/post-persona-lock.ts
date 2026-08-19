import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postPersonaLockBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postPersonaLockBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-persona-lock",
  description:
    "Post the Umbraco Engage Persona Lock resource. Calls POST /umbraco/engage/management/api/v1/persona/lock.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPersonaLock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
