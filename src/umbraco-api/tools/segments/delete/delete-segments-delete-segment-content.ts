import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// `segment` here is NOT this collection's segment `unique`/`id` - it's an
// unrelated internal segment-string identifier (confirmed empirically: the
// server rejects any value not prefixed with `engage_ab-testing_` or
// `engage_personalization_`), and this MCP has no tool that lists those
// strings. Confirmed `segment` 400s when omitted despite being schema-
// optional; `contentId`'s requiredness is unconfirmed (no reachable success
// case to probe it against).
const inputSchema = z.object({
  segment: z.string().describe("An internal segment identifier string prefixed with 'engage_ab-testing_' or 'engage_personalization_' - NOT this collection's segment unique/id. No tool in this server currently lists valid values."),
  contentId: z.uuid().optional().describe("The content item's key to remove this segment's tracked content from."),
});
const outputSchema = z.object({ deleted: z.boolean() });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-segments-delete-segment-content",
  description:
    "Remove tracked content association for an internal AB-testing/personalization segment identifier. `segment` must be prefixed with 'engage_ab-testing_' or 'engage_personalization_' - this is unrelated to the segment entities created by post-segments.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["deleteSegmentsDeleteSegmentContent"]>, ApiClient>(
      (client) => client.deleteSegmentsDeleteSegmentContent(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    if (!result.isError && typeof result.structuredContent === "boolean") {
      return { ...result, structuredContent: { deleted: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
