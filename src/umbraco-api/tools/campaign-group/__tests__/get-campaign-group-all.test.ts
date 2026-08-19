import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-campaign-group-all.js";

describe("get-campaign-group-all", () => {
  setupTestEnvironment();
  it("returns all campaign groups", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
