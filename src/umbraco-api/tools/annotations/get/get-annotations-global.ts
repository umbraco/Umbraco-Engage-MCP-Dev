import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAnnotationsGlobalResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `from`/`to` optional, but on this instance
// omitting either causes a real, deterministic server-side SqlDateTime
// overflow (a 500, not a clean validation error) - required here so
// callers can't hit that.
const inputSchema = z.object({ from: z.iso.datetime(), to: z.iso.datetime() });
const outputSchema = z.object({ items: getAnnotationsGlobalResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-annotations-global",
  description:
    "List 'global' analytics annotations (timeline markers, e.g. deploys or campaign notes, attached to analytics data) within a date range - a separate endpoint from get-annotations-all with the same parameters and response shape; the exact distinction between 'all' and 'global' annotations is not documented upstream. Both `from` and `to` are required - omitting either causes a server-side date-overflow error on some instances.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getAnnotationsGlobal"]>, ApiClient>(
      (client) => client.getAnnotationsGlobal(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
