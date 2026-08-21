import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAbTestPageResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `unique` optional, but the real API always
// returns 400 Bad Request when it's omitted, and also 400s for a
// well-formed but non-existent guid (confirmed empirically) - required here
// so callers get a clear schema-validation error instead of an opaque 400.
const inputSchema = z.object({ unique: z.uuid() });
const outputSchema = z.object({ items: getAbTestPageResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-page",
  description:
    "List all A/B tests that target a given Umbraco content page, identified by the page's `unique` guid. Here 'page' means a content page (an Umbraco document), not a page of paginated results - for the unfiltered list of every A/B test, use get-ab-test-all instead. Returns 400 if `unique` doesn't resolve to a real content page.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getAbTestPage"]>, ApiClient>(
      (client) => client.getAbTestPage(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
