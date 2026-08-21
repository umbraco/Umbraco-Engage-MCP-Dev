import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getDataGenerationLogsTool from "../get/get-data-generation-logs.js";

// Same category as data-cleanup's logs/runs: a background job with no way
// to trigger it on demand, so how many entries exist (if any) by the time
// this test runs varies between runs of the same fresh install (0 vs 1 vs 2
// observed in practice) - shape/types only, not exact content.
describe("get-data-generation-logs", () => {
  setupTestEnvironment();

  it("returns a list of data-generation log entries with the expected shape", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataGenerationLogsTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as {
      items: { started: string; failed: boolean }[];
      total: number;
    };

    expect(Array.isArray(content.items)).toBe(true);
    expect(typeof content.total).toBe("number");
    expect(content.items.length).toBeLessThanOrEqual(content.total);

    for (const entry of content.items) {
      expect(typeof entry.started).toBe("string");
      expect(typeof entry.failed).toBe("boolean");
    }
  });
});
