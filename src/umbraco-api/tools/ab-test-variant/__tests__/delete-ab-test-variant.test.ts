import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteAbTestVariantTool from "../delete/delete-ab-test-variant.js";

describe("delete-ab-test-variant", () => {
  setupTestEnvironment();

  it("is idempotent for a non-existent variant id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestVariantTool.handler(
      { variantId: 999999999 },
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
