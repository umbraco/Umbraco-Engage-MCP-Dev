import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-applied-personalization-all.js";

describe("get-applied-personalization-all", () => {
  setupTestEnvironment();
  it("returns all applied personalizations", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
