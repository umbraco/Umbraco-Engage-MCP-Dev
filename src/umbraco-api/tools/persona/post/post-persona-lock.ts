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
    "Lock a visitor's persona score assignment (`entityId` is the individual persona's sub-entity id from get-persona-details' `personas[N].id`, `visitorId` the visitor's profile id), pinning it so automatic scoring no longer updates it. Requires a real visitor with existing tracking history - a non-existent visitor/entity pair errors.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPersonaLock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
