import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAnalyticsQueryTool from "../post/post-analytics-query.js";

describe("post-analytics-query", () => {
  setupTestEnvironment();

  it("runs an analytics query for a recent date range", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postAnalyticsQueryTool.handler(
      {
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-12-31T23:59:59.000Z",
        metrics: ["pageviews"],
        dimensions: ["date"],
        realtime: false,
        sort: "date",
        ascending: true,
        includeSubpages: false,
        filter: undefined,
      },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // Confirmed via decompiling the real Engage server: AnalyticsQueryService
  // never applies Page/PageSize to the SQL it builds, and always returns
  // these three fields as fixed constants regardless of input - there is no
  // real pagination state to read here. This tool doesn't expose page/
  // pageSize at all (see its own comment) since they'd suggest a control
  // that doesn't work; this test pins the fixed response shape so a future
  // server fix (or regression) is visible.
  it("never reports real pagination state - currentPage/rowsPerPage/totalPages are always fixed", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postAnalyticsQueryTool.handler(
      {
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-12-31T23:59:59.000Z",
        metrics: ["pageviews"],
        dimensions: ["date"],
        realtime: false,
        sort: "date",
        ascending: true,
        includeSubpages: false,
        filter: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as {
      currentPage: number;
      rowsPerPage: number;
      totalPages: number;
    };
    expect(content.currentPage).toBe(1);
    expect(content.rowsPerPage).toBe(9999);
    expect(content.totalPages).toBe(1);
  });
});
