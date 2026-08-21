import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileRelatedQueryParams, getProfileRelatedResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getProfileRelatedQueryParams.extend({
  memberId: getProfileRelatedQueryParams.shape.memberId.describe(
    "An Umbraco member's guid - finds other visitor profiles linked to the same member (e.g. across devices/browsers).",
  ),
});
const outputSchema = z.object({ relatedVisitorIds: getProfileRelatedResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-related",
  description:
    "List numeric visitor ids related to the given member (e.g. other devices/browsers linked to the same member account). Pass each returned id as `visitorId` to other profile tools to inspect that visitor's own activity.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getProfileRelated"]>, ApiClient>(
      (client) => client.getProfileRelated(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { relatedVisitorIds: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
