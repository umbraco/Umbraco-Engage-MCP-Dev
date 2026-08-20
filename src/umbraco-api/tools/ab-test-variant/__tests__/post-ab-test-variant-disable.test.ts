import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postAbTestVariantDisableTool from "../post/post-ab-test-variant-disable.js";

// A genuinely persisted A/B test variant can't be built for this collection
// (requires an existing parent A/B test — an expensive fixture chain out of
// scope, see sibling `ab-test` collection tests for the same limitation).
// This documents the real, verified behavior for a non-existent variantId
// instead of forcing a fake happy path.
const TEST_NON_EXISTENT_VARIANT_ID = 999999999;

describe("post-ab-test-variant-disable", () => {
  setupTestEnvironment();

  it("returns a 404 error for a non-existent variantId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantDisableTool.handler(
      { variantId: TEST_NON_EXISTENT_VARIANT_ID },
      context,
    );

    // Verified empirically: unlike the delete/get endpoints for this
    // resource (which return HTTP 200 with an empty body for a
    // non-existent id), disable returns a genuine HTTP 404.
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      status: 404,
      detail: "Not Found",
    });
  });
});
