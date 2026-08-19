import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupLastRunTool from "../get/get-data-cleanup-last-run.js";

describe("get-data-cleanup-last-run", () => {
  setupTestEnvironment();

  it("returns the last data-cleanup run", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLastRunTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
