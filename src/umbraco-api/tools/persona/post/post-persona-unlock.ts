import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postPersonaUnlockBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postPersonaUnlockBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-persona-unlock",
  description:
    "Post the Umbraco Engage Persona Unlock resource. Calls POST /umbraco/engage/management/api/v1/persona/unlock.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPersonaUnlock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
