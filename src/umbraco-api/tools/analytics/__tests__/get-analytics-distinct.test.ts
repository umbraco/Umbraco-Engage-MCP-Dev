import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAnalyticsDistinctTool from "../get/get-analytics-distinct.js";

describe("get-analytics-distinct", () => {
  setupTestEnvironment();

  it("returns distinct values for the 'country' dimension", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnalyticsDistinctTool.handler(
      { dimension: "country" },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
