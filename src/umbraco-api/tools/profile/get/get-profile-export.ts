import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileExportQueryParams, getProfileExportResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullParams = z.infer<typeof getProfileExportQueryParams>;

// The generated query params use raw PascalCase keys and a dotted
// "ActiveRange.From"/"ActiveRange.To" pair (ASP.NET model-binding
// artifacts) - exposed here as camelCase with flat activeFrom/activeTo,
// matching the convention used by post-profile-overview/-export-csv over
// the same underlying filter set. `skip`/`take` also trigger
// withStandardDecorators' cursor-pagination wrapper (stripping them from
// the exposed schema in favor of a `cursor` param), using `take`'s
// default as the page size.
const inputSchema = z.object({
  skip: z.number().default(0),
  take: z.number().default(25),
  order: getProfileExportQueryParams.shape.Order,
  ascending: getProfileExportQueryParams.shape.Ascending,
  segmentId: getProfileExportQueryParams.shape.SegmentId.describe("A segment's `unique` guid (from get-segments-all)."),
  minimumGoalValue: getProfileExportQueryParams.shape.MinimumGoalValue,
  minimumCompletedGoals: getProfileExportQueryParams.shape.MinimumCompletedGoals,
  isUnidentified: getProfileExportQueryParams.shape.IsUnidentified,
  isIdentified: getProfileExportQueryParams.shape.IsIdentified,
  isHighPotential: getProfileExportQueryParams.shape.IsHighPotential,
  activeFrom: z.iso.datetime().nullish(),
  activeTo: z.iso.datetime().nullish(),
  identifiedName: getProfileExportQueryParams.shape.IdentifiedName,
});
const outputSchema = z.object({ items: getProfileExportResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-export",
  description:
    "Search visitor profiles with the same filters as post-profile-overview (segment, goal thresholds, identification status, active date range), one row per visitor - but with a different, smaller field set (adds `type`/`url`, omits member/personalization detail). Prefer post-profile-overview unless you specifically need this tool's fields. Paginated via `cursor` (pass the previous response's `nextCursor` for the next page; omit for the first page).",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const apiParams: FullParams = {
      Skip: params.skip,
      Take: params.take,
      Order: params.order,
      Ascending: params.ascending,
      SegmentId: params.segmentId,
      MinimumGoalValue: params.minimumGoalValue,
      MinimumCompletedGoals: params.minimumCompletedGoals,
      IsUnidentified: params.isUnidentified,
      IsIdentified: params.isIdentified,
      IsHighPotential: params.isHighPotential,
      "ActiveRange.From": params.activeFrom ?? undefined,
      "ActiveRange.To": params.activeTo ?? undefined,
      IdentifiedName: params.identifiedName,
    };
    const result = await executeGetApiCall<ReturnType<ApiClient["getProfileExport"]>, ApiClient>(
      (client) => client.getProfileExport(apiParams, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
