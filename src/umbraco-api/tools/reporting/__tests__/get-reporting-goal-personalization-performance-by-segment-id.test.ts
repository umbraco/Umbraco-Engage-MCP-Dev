import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-reporting-goal-personalization-performance-by-segment-id.js";

describe("get-reporting-goal-personalization-performance-by-segment-id", () => {
  setupTestEnvironment();

  it("returns goal personalization performance for segmentId=0", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({ segmentId: 0 }, context);
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
