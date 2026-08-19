import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteSegmentsDeleteSegmentContentQueryParams, deleteSegmentsDeleteSegmentContentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteSegmentsDeleteSegmentContentQueryParams;
const outputSchema = deleteSegmentsDeleteSegmentContentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-segments-delete-segment-content",
  description:
    "Delete the Umbraco Engage Segments Delete Segment Content resource. Calls DELETE /umbraco/engage/management/api/v1/segments/delete-segment-content.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["deleteSegmentsDeleteSegmentContent"]>, ApiClient>(
      (client) => client.deleteSegmentsDeleteSegmentContent(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
