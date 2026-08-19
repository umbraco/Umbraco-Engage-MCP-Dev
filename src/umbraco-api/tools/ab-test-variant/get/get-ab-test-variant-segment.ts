import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAbTestVariantSegmentQueryParams, getAbTestVariantSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAbTestVariantSegmentQueryParams;
const outputSchema = getAbTestVariantSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-variant-segment",
  description:
    "Get the Umbraco Engage Ab Test Variant Segment resource. Calls GET /umbraco/engage/management/api/v1/ab-test-variant/segment.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestVariantSegment"]>, ApiClient>(
      (client) => client.getAbTestVariantSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
