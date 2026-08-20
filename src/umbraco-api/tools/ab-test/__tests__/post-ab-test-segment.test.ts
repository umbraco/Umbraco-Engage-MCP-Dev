import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postAbTestSegmentTool from "../post/post-ab-test-segment.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent unique instead of forcing a fake happy path.
const TEST_NON_EXISTENT_UNIQUE = "00000000-0000-0000-0000-000000000000";
const TEST_CULTURE = "en-US";
const TEST_SEGMENT = "test-segment";

describe("post-ab-test-segment", () => {
  setupTestEnvironment();

  it("returns an error for a non-existent unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestSegmentTool.handler(
      {
        unique: TEST_NON_EXISTENT_UNIQUE,
        culture: TEST_CULTURE,
        segment: TEST_SEGMENT,
      },
      context,
    );

    // Verified empirically: a non-existent unique produces a real 400 error
    // rather than the schema's optimistic { created: false }.
    expect(result.isError).toBe(true);
  });
});
