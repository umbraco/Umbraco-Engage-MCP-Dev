import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAnalyticsQueryBody, postAnalyticsQueryResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAnalyticsQueryBody>;

// This is a read-only report query, not a mutation - despite the POST verb.
// `realtime`/`sort`/`ascending`/`page`/`pageSize`/`includeSubpages` are
// boilerplate the underlying API requires but that have obvious sensible
// defaults; only startDate/endDate/metrics/dimensions carry real decision
// content for most callers.
const inputSchema = postAnalyticsQueryBody.extend({
  startDate: postAnalyticsQueryBody.shape.startDate.describe(
    "ISO 8601 datetime, e.g. 2026-01-01T00:00:00Z",
  ),
  endDate: postAnalyticsQueryBody.shape.endDate.describe(
    "ISO 8601 datetime, e.g. 2026-01-31T23:59:59Z",
  ),
  realtime: postAnalyticsQueryBody.shape.realtime.default(false),
  sort: postAnalyticsQueryBody.shape.sort
    .optional()
    .describe("Defaults to the first dimension, or the first metric if there are no dimensions."),
  ascending: postAnalyticsQueryBody.shape.ascending.default(true),
  page: postAnalyticsQueryBody.shape.page.int().min(1).default(1),
  pageSize: postAnalyticsQueryBody.shape.pageSize.int().min(1).max(500).default(25),
  includeSubpages: postAnalyticsQueryBody.shape.includeSubpages.default(false),
  filter: postAnalyticsQueryBody.shape.filter.describe(
    "Free-text filter expression - syntax is not documented by the underlying API; omit unless the exact syntax is already known.",
  ),
});
const outputSchema = postAnalyticsQueryResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-analytics-query",
  description:
    "Run a read-only aggregated analytics report over a date range, grouped by `dimensions` and measured by `metrics`. Returns a paginated table (`columns` + `rows`) with `totalRows`/`totalPages`/`currentPage` to know when to stop paging. Despite the POST verb, this has no side effects.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      ...params,
      sort: params.sort ?? params.dimensions[0] ?? params.metrics[0],
    };
    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsQuery"]>, ApiClient>(
      (client) => client.postAnalyticsQuery(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
