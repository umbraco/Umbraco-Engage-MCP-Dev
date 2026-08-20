import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteAbTestTool from "../delete/delete-ab-test.js";

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent unique instead of forcing a fake happy path.
const TEST_NON_EXISTENT_UNIQUE = "00000000-0000-0000-0000-000000000000";

describe("delete-ab-test", () => {
  setupTestEnvironment();

  it("returns an invalid result for a non-existent unique rather than throwing", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestTool.handler(
      { unique: TEST_NON_EXISTENT_UNIQUE },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and a validation
    // body ({ isValid: false, errors: [...] }) rather than a 400/404 error —
    // so this is not an isError case.
    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as {
      isValid?: boolean;
      errors?: string[];
    };
    expect(structuredContent?.isValid).toBe(false);
    expect(structuredContent?.errors).toEqual([
      `${TEST_NON_EXISTENT_UNIQUE} is not a valid A/B id`,
    ]);
  });
});
