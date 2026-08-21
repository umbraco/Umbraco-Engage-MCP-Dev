import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postHeatmapsGenerateScrollHeatmapBody, postHeatmapsGenerateScrollHeatmapResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postHeatmapsGenerateScrollHeatmapBody>;

// The device type enum values, in the same order the wire protocol expects
// as numeric ordinals for `deviceTypes` - reused from the equivalent named
// enum elsewhere in this API rather than exposing raw, undocumented codes.
const DEVICE_TYPES = [
  "Unknown", "Desktop", "Tablet", "Mobile", "Console", "TV", "CarBrowser",
  "SmartDisplay", "Camera", "PortableMediaPlayer", "Phablet", "SmartSpeaker", "Wearable",
] as const;

const inputSchema = z.object({
  unique: postHeatmapsGenerateScrollHeatmapBody.shape.unique.describe(
    "The content page's `unique` guid.",
  ),
  from: postHeatmapsGenerateScrollHeatmapBody.shape.from,
  to: postHeatmapsGenerateScrollHeatmapBody.shape.to,
  culture: postHeatmapsGenerateScrollHeatmapBody.shape.culture,
  segment: postHeatmapsGenerateScrollHeatmapBody.shape.segment,
  deviceTypes: z.array(z.enum(DEVICE_TYPES)).nullish(),
  borderLines: postHeatmapsGenerateScrollHeatmapBody.shape.borderLines.describe(
    "Pixel offsets to report visitor-reach percentages for (e.g. fold lines).",
  ),
});
const outputSchema = postHeatmapsGenerateScrollHeatmapResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-heatmaps-generate-scroll-heatmap",
  description:
    "Generate a scroll-depth heatmap for a page over an optional date range - returns the percentage of visitors who scrolled to each pixel depth. Despite the POST verb, this is a read-only report over existing tracking data, not a mutation.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      ...params,
      deviceTypes: params.deviceTypes?.map((type) => DEVICE_TYPES.indexOf(type)) ?? null,
    };
    return executeGetApiCall<ReturnType<ApiClient["postHeatmapsGenerateScrollHeatmap"]>, ApiClient>(
      (client) => client.postHeatmapsGenerateScrollHeatmap(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
