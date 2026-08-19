import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteSegmentsQueryParams } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteSegmentsQueryParams;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-segments",
  description:
    "Delete the Umbraco Engage Segments resource. Calls DELETE /umbraco/engage/management/api/v1/segments.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteSegments(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
