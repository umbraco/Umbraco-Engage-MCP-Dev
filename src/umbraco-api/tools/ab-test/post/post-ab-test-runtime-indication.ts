import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAbTestRuntimeIndicationBody, postAbTestRuntimeIndicationResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAbTestRuntimeIndicationBody;
const outputSchema = postAbTestRuntimeIndicationResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-runtime-indication",
  description:
    "Post the Umbraco Engage Ab Test Runtime Indication resource. Calls POST /umbraco/engage/management/api/v1/ab-test/runtime-indication.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestRuntimeIndication"]>, ApiClient>(
      (client) => client.postAbTestRuntimeIndication(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
