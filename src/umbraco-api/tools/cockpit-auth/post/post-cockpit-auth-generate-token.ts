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
    "Post the Umbraco Engage Cockpit Auth Generate Token resource. Calls POST /umbraco/engage/management/api/v1/cockpit-auth/generate-token.",
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
