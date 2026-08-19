import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAppliedPersonalizationBody, postAppliedPersonalizationResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAppliedPersonalizationBody;
const outputSchema = postAppliedPersonalizationResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-applied-personalization",
  description:
    "Post the Umbraco Engage Applied Personalization resource. Calls POST /umbraco/engage/management/api/v1/applied-personalization.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAppliedPersonalization"]>, ApiClient>(
      (client) => client.postAppliedPersonalization(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
