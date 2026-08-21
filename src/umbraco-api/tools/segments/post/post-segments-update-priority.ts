import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postSegmentsUpdatePriorityBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({
  items: postSegmentsUpdatePriorityBody.describe(
    "Segments to reorder, each identified by its numeric `id` (from get-segments-all, not its `unique` guid) with the new `sortOrder` to apply.",
  ),
});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-segments-update-priority",
  description:
    "Reorder segments by updating their `sortOrder` values. Pass one or more {id, sortOrder} pairs; only the listed segments are changed.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postSegmentsUpdatePriority(params.items, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
