import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAppliedPersonalizationSegmentQueryParams, postAppliedPersonalizationSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAppliedPersonalizationSegmentQueryParams;
const outputSchema = postAppliedPersonalizationSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-applied-personalization-segment",
  description:
    "Post the Umbraco Engage Applied Personalization Segment resource. Calls POST /umbraco/engage/management/api/v1/applied-personalization/segment.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAppliedPersonalizationSegment"]>, ApiClient>(
      (client) => client.postAppliedPersonalizationSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
