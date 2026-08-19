import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import unlockTool from "../post/post-persona-unlock.js";

describe("post-persona-unlock", () => {
  setupTestEnvironment();

  // See post-persona-lock.test.ts for why only the non-existent-pair path
  // is covered here — reproducing a real visitor/persona score assignment
  // requires simulating real analytics/tracking events.
  it("returns an error for a non-existent visitor/entity pair", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await unlockTool.handler(
      { entityId: 999999, visitorId: 999999 },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
