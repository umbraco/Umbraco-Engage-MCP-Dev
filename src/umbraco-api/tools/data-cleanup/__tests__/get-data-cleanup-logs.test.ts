import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getDataCleanupLogsTool from "../get/get-data-cleanup-logs.js";

// Same underlying background job as get-data-cleanup-runs, just flattened
// per-table - same "no way to trigger on demand, count varies run to run"
// issue, so this asserts shape/types rather than exact content.
describe("get-data-cleanup-logs", () => {
  setupTestEnvironment();

  it("returns a list of data-cleanup log entries with the expected shape", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataCleanupLogsTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as {
      items: {
        runId: string;
        started: string;
        durationMs: number;
        recordsAffected: number;
        failed: boolean;
      }[];
      total: number;
    };

    expect(Array.isArray(content.items)).toBe(true);
    expect(typeof content.total).toBe("number");
    expect(content.items.length).toBeLessThanOrEqual(content.total);

    for (const entry of content.items) {
      expect(typeof entry.runId).toBe("string");
      expect(typeof entry.durationMs).toBe("number");
      expect(typeof entry.failed).toBe("boolean");
    }
  });
});
