import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAbTestBody, postAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAbTestBody;
const outputSchema = postAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test",
  description:
    "Post the Umbraco Engage Ab Test resource. Calls POST /umbraco/engage/management/api/v1/ab-test.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTest"]>, ApiClient>(
      (client) => client.postAbTest(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
