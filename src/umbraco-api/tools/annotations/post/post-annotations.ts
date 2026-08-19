import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAnnotationsBody, postAnnotationsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAnnotationsBody;
const outputSchema = postAnnotationsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-annotations",
  description:
    "Post the Umbraco Engage Annotations resource. Calls POST /umbraco/engage/management/api/v1/annotations.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAnnotations"]>, ApiClient>(
      (client) => client.postAnnotations(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
