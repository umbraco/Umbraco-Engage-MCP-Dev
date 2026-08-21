import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postCockpitAuthGenerateTokenResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = postCockpitAuthGenerateTokenResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-cockpit-auth-generate-token",
  description:
    "Issue a short-lived bearer token (with an `expires` timestamp) authorizing the Engage Cockpit editor overlay widget. The returned `token` is a live credential - avoid displaying or logging its full value unnecessarily.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["postCockpitAuthGenerateToken"]>, ApiClient>(
      (client) => client.postCockpitAuthGenerateToken(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
