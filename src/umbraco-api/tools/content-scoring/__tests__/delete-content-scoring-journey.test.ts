import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteTool from "../delete/delete-content-scoring-journey.js";

describe("delete-content-scoring-journey", () => {
  setupTestEnvironment();

  // See delete-content-scoring-persona.test.ts for why only the
  // non-existent-id path is covered here: get-content-scoring-all is
  // already known-broken (400) on this instance, and post-content-scoring-save
  // is void, so there is no way to discover a real persisted entry's id.
  it("is idempotent for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler({ id: 999999999 }, context);

    expect(result.isError).toBeFalsy();
  });
});
