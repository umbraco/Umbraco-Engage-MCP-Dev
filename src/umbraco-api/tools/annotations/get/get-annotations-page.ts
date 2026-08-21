import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAnnotationsPageQueryParams, getAnnotationsPageResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// `unique` is required here - a lookup with no target page is meaningless
// (unlike from/to, which this endpoint tolerates omitted). `culture`
// defaults to "" (invariant culture) matching the real API's own default.
const inputSchema = getAnnotationsPageQueryParams.extend({
  unique: z.uuid(),
  culture: getAnnotationsPageQueryParams.shape.culture.default(""),
});
const outputSchema = z.object({ items: getAnnotationsPageResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-annotations-page",
  description:
    "List analytics annotations (timeline markers, e.g. deploys or campaign notes) attached to a specific content page, identified by its `unique` guid. Optionally filter by date range and culture; `culture` defaults to the invariant culture.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getAnnotationsPage"]>, ApiClient>(
      (client) => client.getAnnotationsPage(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
