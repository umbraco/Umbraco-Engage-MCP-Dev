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
        page: 1,
        pageSize: 10,
        includeSubpages: false,
        filter: undefined,
      },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
