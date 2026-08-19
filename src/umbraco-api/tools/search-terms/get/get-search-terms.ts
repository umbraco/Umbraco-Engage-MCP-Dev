import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getSearchTermsQueryParams, getSearchTermsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getSearchTermsQueryParams;
const outputSchema = z.object({ items: getSearchTermsResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-search-terms",
  description:
    "List the Umbraco Engage Search Terms resource. Calls GET /umbraco/engage/management/api/v1/search-terms.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getSearchTerms"]>, ApiClient>(
      (client) => client.getSearchTerms(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
