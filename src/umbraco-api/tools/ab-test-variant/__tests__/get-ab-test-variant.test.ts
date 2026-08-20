import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestVariantTool from "../get/get-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// A genuinely persisted A/B test variant can't be built for this collection
// (requires an existing parent A/B test — an expensive fixture chain out of
// scope, see sibling `ab-test` collection tests for the same limitation).
// This documents the real, verified behavior for a non-existent id instead
// of forcing a fake happy path.
const TEST_NON_EXISTENT_ID = 999999999;

describe("get-ab-test-variant", () => {
  setupTestEnvironment();

  it("returns an empty body rather than throwing for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestVariantTool.handler(
      { id: TEST_NON_EXISTENT_ID },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and no body for
    // a non-existent id (not a 404) — so this is not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
