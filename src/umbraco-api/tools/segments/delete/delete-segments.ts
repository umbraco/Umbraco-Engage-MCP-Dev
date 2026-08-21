import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// Despite the generated param name, `id` here is the segment's `unique`
// guid, not its numeric `id`. Omitting it does NOT error; it silently
// returns an empty success with no indication anything happened, so `id`
// is made required here instead (deleting a non-existent guid is
// confirmed idempotent - a real, clean success).
const inputSchema = z.object({
  id: z.uuid().describe("The segment's unique guid (from get-segments-all's `unique` field, not its numeric `id`)."),
});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-segments",
  description:
    "Delete a segment by its unique guid. Idempotent - deleting an already-deleted or non-existent guid still succeeds.",
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
