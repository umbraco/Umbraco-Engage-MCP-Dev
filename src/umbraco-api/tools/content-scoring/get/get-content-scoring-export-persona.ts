import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
// The generated schema declares this as a File, but the real response is
// plain CSV text placed directly in structuredContent (confirmed
// empirically) - a bare string violates the MCP requirement that
// structuredContent be a JSON object, so it's wrapped as { csv: string }.
const outputSchema = z.object({ csv: z.string() });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-scoring-export-persona",
  description:
    "Export all persona content-scoring data as CSV text (header row starts with ContentLink, ContentName - further columns depend on which personas have scored content). Returns the full, unfiltered dataset - use get-content-scoring-all instead to query scores for one specific document.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getContentScoringExportPersona"]>, ApiClient>(
      (client) => client.getContentScoringExportPersona(CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap the raw CSV string.
    if (!result.isError && typeof result.structuredContent === "string") {
      return { ...result, structuredContent: { csv: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
