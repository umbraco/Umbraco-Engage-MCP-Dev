import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import deleteAbTestVariantTool from "../delete/delete-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// A genuinely persisted A/B test variant can't be built for this collection
// (requires an existing parent A/B test — an expensive fixture chain out of
// scope, see sibling `ab-test` collection tests for the same limitation).
// This documents the real, verified behavior for a non-existent variantId
// instead of forcing a fake happy path.
const TEST_NON_EXISTENT_VARIANT_ID = 999999999;

describe("delete-ab-test-variant", () => {
  setupTestEnvironment();

  it("returns success rather than throwing for a non-existent variantId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestVariantTool.handler(
      { variantId: TEST_NON_EXISTENT_VARIANT_ID },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and no body
    // (void endpoint) regardless of whether the variantId exists — so this
    // is not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
