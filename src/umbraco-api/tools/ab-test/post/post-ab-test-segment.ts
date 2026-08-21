import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAbTestSegmentQueryParams, postAbTestSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAbTestSegmentQueryParams;
const outputSchema = postAbTestSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-segment",
  description:
    "Record which A/B test variant segment a visitor falls into for a content page. In practice this consistently returns a generic 400 Bad Request (with no further detail) for every input combination tried - including a real test's own `unique`, its real content page's `unique`, and the test's real server-assigned segment value. This is very likely because the endpoint requires the target test to be in Running status, and no tool in this collection can transition a test out of Draft - so this tool is likely unusable via this MCP server today.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestSegment"]>, ApiClient>(
      (client) => client.postAbTestSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
