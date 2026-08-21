import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAbTestPreviewUrlQueryParams, getAbTestPreviewUrlResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAbTestPreviewUrlQueryParams;
const outputSchema = getAbTestPreviewUrlResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-preview-url",
  description:
    "Get a preview URL for a specific A/B test variant. Never returns a hard error: for a non-existent test/variant id, or a real variant on a test that hasn't been started (still in Draft status), it returns HTTP 200 with { errorMessage: '<reason>', previewUrl: null } - check `errorMessage`/`previewUrl`, not `isError`, to tell success from failure. A non-null previewUrl requires the test to be in Running status, which no tool in this collection can currently set.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestPreviewUrl"]>, ApiClient>(
      (client) => client.getAbTestPreviewUrl(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
