import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupLogsTool from "../get/get-data-cleanup-logs.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-data-cleanup-logs", () => {
  setupTestEnvironment();

  it("returns data-cleanup logs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLogsTool.handler({}, context);
    // started/finished/durationMs/runId are background-job timing/identity
    // data — never reproducible across runs, so normalize before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
