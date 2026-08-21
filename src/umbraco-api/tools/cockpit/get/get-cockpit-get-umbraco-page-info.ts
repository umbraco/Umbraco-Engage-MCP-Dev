import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getCockpitGetUmbracoPageInfoResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks both params optional, but both are genuinely
// required (confirmed empirically) - omitting `culture` returns a clean
// 400 naming the field, while omitting `pageId` (with culture present)
// returns an opaque 403 Forbidden instead.
const inputSchema = z.object({ pageId: z.uuid(), culture: z.string() });
const outputSchema = getCockpitGetUmbracoPageInfoResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-cockpit-get-umbraco-page-info",
  description:
    "Get publish status, document type, template, canonical URL, and last-edited-by info for a content page, as surfaced by the Engage Cockpit editor overlay. `pageId` is the content node's guid (from a CMS content tool); `culture` selects the language variant - both are required. The response's `id` is the page's classic integer content id, not the `pageId` guid used as input.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getCockpitGetUmbracoPageInfo"]>, ApiClient>(
      (client) => client.getCockpitGetUmbracoPageInfo(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
