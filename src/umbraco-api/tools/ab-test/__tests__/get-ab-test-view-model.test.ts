import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getAbTestViewModelTool from "../get/get-ab-test-view-model.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent unique instead of forcing a fake happy path.
const TEST_NON_EXISTENT_UNIQUE = "00000000-0000-0000-0000-000000000000";

describe("get-ab-test-view-model", () => {
  setupTestEnvironment();

  it("returns a 404 error for a non-existent unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestViewModelTool.handler(
      { unique: TEST_NON_EXISTENT_UNIQUE },
      context,
    );

    expect(result.isError).toBe(true);
    const structuredContent = result.structuredContent as { status?: number };
    expect(structuredContent?.status).toBe(404);
  });
});
