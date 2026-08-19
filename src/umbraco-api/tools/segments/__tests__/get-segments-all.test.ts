import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-segments-all.js";

describe("get-segments-all", () => {
  setupTestEnvironment();
  it("returns all segments", async () => {
    const result = await tool.handler(
      { isTemporary: undefined, amountOfDays: undefined },
      createMockRequestHandlerExtra(),
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
