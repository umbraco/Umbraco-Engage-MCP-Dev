import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestVariantSegmentTool from "../get/get-ab-test-variant-segment.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// A genuinely persisted A/B test variant with a segment can't be built for
// this collection (requires an existing parent A/B test — an expensive
// fixture chain out of scope, see sibling `ab-test` collection tests for the
// same limitation). This documents the real, verified behavior for a
// non-existent segment instead of forcing a fake happy path.
const TEST_NON_EXISTENT_SEGMENT = "_test-non-existent-segment";

describe("get-ab-test-variant-segment", () => {
  setupTestEnvironment();

  it("returns a null body rather than throwing for a non-existent segment", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestVariantSegmentTool.handler(
      { segment: TEST_NON_EXISTENT_SEGMENT },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and a literal
    // JSON `null` body for a non-existent segment (not a 404) — so this is
    // not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
