import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-ab-test-variant-all.js";

describe("get-ab-test-variant-all", () => {
  setupTestEnvironment();
  it("returns A/B test variants for an unknown test", async () => {
    const result = await tool.handler({ abTestId: undefined }, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
