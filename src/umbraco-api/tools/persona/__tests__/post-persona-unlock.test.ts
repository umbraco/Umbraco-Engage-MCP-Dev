import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-persona-unlock.js";

// Unlocking a persona score assignment requires a real visitor with real
// analytics/tracking history — reproducing one is out of scope for an
// integration test. A non-existent entity/visitor pair reliably returns an
// error, which is what we verify here.
const TEST_NON_EXISTENT_ENTITY_ID = 999999;
const TEST_NON_EXISTENT_VISITOR_ID = 999999;

describe("post-persona-unlock", () => {
  setupTestEnvironment();

  it("should return error for non-existent entity/visitor pair", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        entityId: TEST_NON_EXISTENT_ENTITY_ID,
        visitorId: TEST_NON_EXISTENT_VISITOR_ID,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
