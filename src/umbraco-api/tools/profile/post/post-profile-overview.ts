import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postProfileOverviewBody, postProfileOverviewResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postProfileOverviewBody;
const outputSchema = postProfileOverviewResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-profile-overview",
  description:
    "Post the Umbraco Engage Profile Overview resource. Calls POST /umbraco/engage/management/api/v1/profile/overview.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postProfileOverview"]>, ApiClient>(
      (client) => client.postProfileOverview(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
