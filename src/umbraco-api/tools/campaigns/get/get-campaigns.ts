import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getCampaignsQueryParams, getCampaignsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getCampaignsQueryParams.extend({
  visitorId: getCampaignsQueryParams.shape.visitorId.describe(
    "The numeric visitor id (same id used by get-profile-details) to scope results to one visitor's campaign touchpoints. Omitting it returns campaign touchpoints across the entire installation, unfiltered and unpaginated.",
  ),
});
const outputSchema = z.object({ items: getCampaignsResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-campaigns",
  description:
    "List UTM campaign-attribution touchpoints (source/medium/campaign name + timestamp) recorded for visitors. Pass `visitorId` to scope to one visitor - omitting it returns every touchpoint across the whole installation.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getCampaigns"]>, ApiClient>(
      (client) => client.getCampaigns(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
