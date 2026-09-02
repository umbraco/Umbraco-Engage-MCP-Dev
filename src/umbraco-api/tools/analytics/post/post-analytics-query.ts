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
// `realtime`/`sort`/`ascending`/`includeSubpages` are boilerplate the
// underlying API requires but that have obvious sensible defaults; only
// startDate/endDate/metrics/dimensions carry real decision content for most
// callers.
//
// `page`/`pageSize` are deliberately NOT exposed here: the real server
// accepts them but never applies them - the query has no LIMIT/OFFSET at
// all, and the response's own currentPage/rowsPerPage/totalPages are fixed
// constants (1/9999/1) regardless of what's sent. Every matching row always
// comes back in one response; there is no way to page through them via this
// endpoint. Since exposing them would suggest a working control that isn't
// there, they're hardcoded internally instead.
const inputSchema = postAnalyticsQueryBody
  .omit({ page: true, pageSize: true })
  .extend({
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
    includeSubpages: postAnalyticsQueryBody.shape.includeSubpages.default(false),
    filter: postAnalyticsQueryBody.shape.filter.describe(
      "Free-text filter expression - syntax is not documented by the underlying API; omit unless the exact syntax is already known.",
    ),
  });
const outputSchema = postAnalyticsQueryResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-analytics-query",
  description:
    "Run a read-only aggregated analytics report over a date range, grouped by `dimensions` and measured by `metrics`. Returns a table (`columns` + `rows`) with every matching row in one response - the server does not support pagination for this query (its `totalRows`/`totalPages`/`currentPage`/`rowsPerPage` fields are fixed placeholder values, not real state), so a broad date range with many dimensions/metrics can return a very large `rows` array. Narrow `startDate`/`endDate` or the `dimensions`/`metrics` selected to control result size. Despite the POST verb, this has no side effects.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      ...params,
      sort: params.sort ?? params.dimensions[0] ?? params.metrics[0],
      page: 1,
      pageSize: 1000,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsQuery"]>, ApiClient>(
      (client) => client.postAnalyticsQuery(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
