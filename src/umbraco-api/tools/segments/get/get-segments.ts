import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getSegmentsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// Despite the generated param name, `id` here is the segment's `unique`
// guid (from get-segments-all), not its numeric `id` - confirmed
// empirically. Omitting it or supplying a non-existent guid does NOT
// error; it silently returns `structuredContent: null` with no
// indication of failure, so `id` is made required here instead.
const inputSchema = z.object({
  id: z.uuid().describe("The segment's unique guid (from get-segments-all's `unique` field, not its numeric `id`)."),
});
const outputSchema = getSegmentsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-segments",
  description:
    "Get a single segment by its unique guid. Omitting `id` or supplying a non-existent one silently returns no data rather than an error, so always pass a real guid from get-segments-all.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getSegments"]>, ApiClient>(
      (client) => client.getSegments(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
