import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupRunsTool from "../get/get-data-cleanup-runs.js";

describe("get-data-cleanup-runs", () => {
  setupTestEnvironment();

  it("returns data-cleanup runs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupRunsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
