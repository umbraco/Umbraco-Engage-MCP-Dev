import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import lockTool from "../post/post-persona-lock.js";

describe("post-persona-lock", () => {
  setupTestEnvironment();

  // This locks a persona *score assignment* for a real visitor — reproducing
  // one would require simulating real analytics/tracking events (a much
  // deeper fixture chain than this collection). This documents the tool's
  // real, reliably reproducible behavior for a non-existent visitor/entity
  // pair instead (verified against the live API).
  it("returns an error for a non-existent visitor/entity pair", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await lockTool.handler(
      { entityId: 999999, visitorId: 999999 },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
