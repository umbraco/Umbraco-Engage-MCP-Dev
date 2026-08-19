import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-ab-test-project-all.js";

describe("get-ab-test-project-all", () => {
  setupTestEnvironment();
  it("returns all A/B test projects", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
