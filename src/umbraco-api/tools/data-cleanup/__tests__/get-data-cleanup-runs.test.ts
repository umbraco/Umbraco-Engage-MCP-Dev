import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataCleanupRunsTool from "../get/get-data-cleanup-runs.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-data-cleanup-runs", () => {
  setupTestEnvironment();

  it("returns data-cleanup runs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupRunsTool.handler({}, context);
    // started/finished/totalDurationMs/runId (top-level) and durationMs
    // (per detail entry) are background-job timing/identity data — never
    // reproducible across runs, so normalize before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
