import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-content-scoring-all.js";

describe("get-content-scoring-all", () => {
  setupTestEnvironment();
  it("returns all content scoring assignments", async () => {
    const result = await tool.handler({ unique: undefined }, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
