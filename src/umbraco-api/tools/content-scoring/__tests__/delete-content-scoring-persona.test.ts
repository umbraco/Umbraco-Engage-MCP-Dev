import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteTool from "../delete/delete-content-scoring-persona.js";

describe("delete-content-scoring-persona", () => {
  setupTestEnvironment();

  // get-content-scoring-all returns a 400 on this instance (a pre-existing,
  // already-documented quirk — see its own test's snapshot), so there is no
  // reliable way to discover a real persisted content-scoring entry's
  // numeric id to delete. post-content-scoring-save is also void, so it
  // never returns one either. This covers the tool's real, reliably
  // reproducible behavior instead: it succeeds (does not throw/error) even
  // for an id that was never assigned.
  it("is idempotent for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler({ id: 999999999 }, context);

    expect(result.isError).toBeFalsy();
  });
});
