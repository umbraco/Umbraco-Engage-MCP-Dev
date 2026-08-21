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
    "Unlock a visitor's persona score assignment previously locked via post-persona-lock (`entityId` is the individual persona's sub-entity id from get-persona-details' `personas[N].id`, `visitorId` the visitor's profile id), letting automatic scoring resume updating it.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPersonaUnlock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
