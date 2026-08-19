import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getReportingTool from "../get/get-reporting.js";

describe("get-reporting", () => {
  setupTestEnvironment();

  it("returns reporting rows (no segment filter)", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getReportingTool.handler({ segmentId: undefined }, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
