import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getSegmentsQueryParams, getSegmentsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getSegmentsQueryParams;
const outputSchema = getSegmentsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-segments",
  description:
    "Get the Umbraco Engage Segments resource. Calls GET /umbraco/engage/management/api/v1/segments.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getSegments"]>, ApiClient>(
      (client) => client.getSegments(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
