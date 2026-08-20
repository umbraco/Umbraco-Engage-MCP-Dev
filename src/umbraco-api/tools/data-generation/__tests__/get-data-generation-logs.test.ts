import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getDataGenerationLogsTool from "../get/get-data-generation-logs.js";

describe("get-data-generation-logs", () => {
  setupTestEnvironment();

  // Not snapshotted: this instance's background data-generation job runs
  // periodically and appends a new log entry each time, so both the count
  // and the timestamps grow/change between runs instead of staying fixed.
  it("returns data generation logs", async () => {
    const context = createMockRequestHandlerExtra();
    const result: any = await getDataGenerationLogsTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
  });
});
