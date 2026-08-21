import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAppliedPersonalizationAllResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = z.object({ items: getAppliedPersonalizationAllResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-applied-personalization-all",
  description:
    "List every applied personalization (rules that show different content/css/javascript to visitors matching a segment) across the whole site, unfiltered and unpaginated. Each item's `unique` guid is what get-applied-personalization-id/delete-applied-personalization expect as `id`.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getAppliedPersonalizationAll"]>, ApiClient>(
      (client) => client.getAppliedPersonalizationAll(CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
