import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postAbTestVariantCreateTool from "../post/post-ab-test-variant-create.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal and a configured page — out of scope, see sibling
// `ab-test` collection tests for the same limitation). This documents the
// real, verified behavior for a non-existent testId instead of forcing a
// fake happy path.
const TEST_NON_EXISTENT_TEST_ID = 999999999;

describe("post-ab-test-variant-create", () => {
  setupTestEnvironment();

  it("returns an error when the parent A/B test does not exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantCreateTool.handler(
      { testId: TEST_NON_EXISTENT_TEST_ID },
      context,
    );

    // Verified empirically: the server attempts to INSERT a new default
    // variant row for the given testId and the database rejects it with a
    // FOREIGN KEY constraint violation (HTTP 500), surfaced as an error.
    expect(result.isError).toBe(true);
    expect(String(result.structuredContent)).toContain("FOREIGN KEY constraint");
  });
});
