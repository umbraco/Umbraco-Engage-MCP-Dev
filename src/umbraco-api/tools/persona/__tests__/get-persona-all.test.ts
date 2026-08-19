import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-persona-all.js";

describe("get-persona-all", () => {
  setupTestEnvironment();
  it("returns all personas", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
