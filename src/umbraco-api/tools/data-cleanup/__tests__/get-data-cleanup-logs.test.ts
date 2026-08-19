import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupLogsTool from "../get/get-data-cleanup-logs.js";

describe("get-data-cleanup-logs", () => {
  setupTestEnvironment();

  it("returns data-cleanup logs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLogsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
