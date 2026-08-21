import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getDataCleanupLastRunTool from "../get/get-data-cleanup-last-run.js";

// Same underlying background job as get-data-cleanup-runs/-logs - no API to
// trigger it on demand, so whether it has run yet by the time this test
// executes is a race, not a fixed value. Confirmed empirically in CI: the
// response is `null` when no run has completed yet, and a full object once
// one has - so this tolerates either rather than snapshotting exact content.
describe("get-data-cleanup-last-run", () => {
  setupTestEnvironment();

  it("returns either null (no run yet) or the last run's shape", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLastRunTool.handler({}, context);

    expect(result.isError).toBeFalsy();

    const content = result.structuredContent as {
      totalDurationMs: number;
      failed: boolean;
      anonymizeAfterDays: number;
      deleteAfterDays: number;
      databaseSchemaComplete: boolean;
    } | null;

    if (content !== null) {
      expect(typeof content.totalDurationMs).toBe("number");
      expect(typeof content.failed).toBe("boolean");
      expect(typeof content.anonymizeAfterDays).toBe("number");
      expect(typeof content.deleteAfterDays).toBe("number");
      expect(typeof content.databaseSchemaComplete).toBe("boolean");
    }
  });
});
