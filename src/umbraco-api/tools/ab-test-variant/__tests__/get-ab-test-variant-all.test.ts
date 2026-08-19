import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-ab-test-variant-all.js";

describe("get-ab-test-variant-all", () => {
  setupTestEnvironment();
  it("returns A/B test variants for an unknown test", async () => {
    const result = await tool.handler({ abTestId: undefined }, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
