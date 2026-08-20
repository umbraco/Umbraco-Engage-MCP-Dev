import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestPreviewUrlTool from "../get/get-ab-test-preview-url.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent id instead of forcing a fake happy path.
const TEST_NON_EXISTENT_AB_TEST_ID = 999999;
const TEST_NON_EXISTENT_VARIANT_ID = 999999;

describe("get-ab-test-preview-url", () => {
  setupTestEnvironment();

  it("returns a soft not-found errorMessage for a non-existent A/B test id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestPreviewUrlTool.handler(
      {
        abTestId: TEST_NON_EXISTENT_AB_TEST_ID,
        variantId: TEST_NON_EXISTENT_VARIANT_ID,
      },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and a soft
    // { errorMessage, previewUrl: null } body rather than a 404 error.
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
