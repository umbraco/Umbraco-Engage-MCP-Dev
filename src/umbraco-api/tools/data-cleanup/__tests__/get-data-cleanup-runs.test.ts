import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getDataCleanupRunsTool from "../get/get-data-cleanup-runs.js";

// This tool lists a background job's run history with no way to trigger it
// on demand - whether any runs exist yet (and how many) depends entirely on
// when Engage's own internal scheduler happens to fire relative to this
// test, which varies even between two runs of the same fresh install (0 vs
// 1 vs 2 runs observed in practice). An exact-content snapshot can never be
// stable here, so this asserts shape/types instead.
describe("get-data-cleanup-runs", () => {
  setupTestEnvironment();

  it("returns a list of data-cleanup runs with the expected shape", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupRunsTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as {
      items: {
        runId: string;
        started: string;
        finished: string;
        totalDurationMs: number;
        totalRecordsAffected: number;
        failed: boolean;
        details: { executor: string; durationMs: number; recordsAffected: number; failed: boolean }[];
      }[];
      total: number;
    };

    expect(Array.isArray(content.items)).toBe(true);
    expect(typeof content.total).toBe("number");
    expect(content.items.length).toBeLessThanOrEqual(content.total);

    for (const run of content.items) {
      expect(typeof run.runId).toBe("string");
      expect(typeof run.failed).toBe("boolean");
      expect(Array.isArray(run.details)).toBe(true);
    }
  });
});
