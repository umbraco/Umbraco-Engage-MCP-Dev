import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postHeatmapsGenerateScrollHeatmapBody, postHeatmapsGenerateScrollHeatmapResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postHeatmapsGenerateScrollHeatmapBody;
const outputSchema = postHeatmapsGenerateScrollHeatmapResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-heatmaps-generate-scroll-heatmap",
  description:
    "Post the Umbraco Engage Heatmaps Generate Scroll Heatmap resource. Calls POST /umbraco/engage/management/api/v1/heatmaps/generate-scroll-heatmap.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postHeatmapsGenerateScrollHeatmap"]>, ApiClient>(
      (client) => client.postHeatmapsGenerateScrollHeatmap(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
