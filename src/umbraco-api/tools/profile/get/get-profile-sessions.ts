import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileSessionsQueryParams, getProfileSessionsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullParams = z.infer<typeof getProfileSessionsQueryParams>;

// The generated schema uses raw PascalCase keys (ASP.NET model-binding
// artifacts), inconsistent with every sibling profile tool's camelCase -
// exposed here as camelCase with sensible pagination defaults instead of
// none at all. `pageIndex` is 0-based (unconfirmed upstream, following the
// .NET convention this API otherwise uses).
const inputSchema = z.object({
  visitorId: getProfileSessionsQueryParams.shape.VisitorId.describe(
    "Required in practice - omitting it is untested/undocumented behavior.",
  ),
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(200).default(25),
});
const outputSchema = getProfileSessionsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-sessions",
  description:
    "List a visitor's browsing sessions, paginated (`pageIndex` is 0-based). Use the response's `totalResults` to know when to stop paging.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const apiParams: FullParams = {
      VisitorId: params.visitorId,
      PageIndex: params.pageIndex,
      PageSize: params.pageSize,
    };
    return executeGetApiCall<ReturnType<ApiClient["getProfileSessions"]>, ApiClient>(
      (client) => client.getProfileSessions(apiParams, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
