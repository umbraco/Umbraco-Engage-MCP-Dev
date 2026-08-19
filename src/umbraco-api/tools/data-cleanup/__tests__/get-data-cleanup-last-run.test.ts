import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupLastRunTool from "../get/get-data-cleanup-last-run.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-data-cleanup-last-run", () => {
  setupTestEnvironment();

  it("returns the last data-cleanup run", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLastRunTool.handler({}, context);
    // started/finished/totalDurationMs are background-job timing data — never
    // reproducible across runs, so normalize them before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
