import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAppliedPersonalizationSegmentQueryParams, getAppliedPersonalizationSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAppliedPersonalizationSegmentQueryParams;
const outputSchema = getAppliedPersonalizationSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-applied-personalization-segment",
  description:
    "Get the Umbraco Engage Applied Personalization Segment resource. Calls GET /umbraco/engage/management/api/v1/applied-personalization/segment.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAppliedPersonalizationSegment"]>, ApiClient>(
      (client) => client.getAppliedPersonalizationSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
