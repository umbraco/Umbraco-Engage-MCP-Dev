import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getAbTestTool from "../get/get-ab-test.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent id instead of forcing a fake happy path.
const TEST_NON_EXISTENT_ID = 999999;

describe("get-ab-test", () => {
  setupTestEnvironment();

  it("returns a 404 error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestTool.handler(
      { id: TEST_NON_EXISTENT_ID },
      context,
    );

    expect(result.isError).toBe(true);
    const structuredContent = result.structuredContent as { status?: number };
    expect(structuredContent?.status).toBe(404);
  });
});
