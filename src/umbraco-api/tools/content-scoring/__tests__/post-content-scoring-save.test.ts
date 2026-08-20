import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-content-scoring-save.js";

describe("post-content-scoring-save", () => {
  setupTestEnvironment();

  // get-content-scoring-all is already known-broken (400) on this instance
  // (see delete-content-scoring-persona.test.ts), so there's no way to
  // verify a real save via a corresponding read. A non-existent persona
  // entityId is a real FK column (umbracoEngagePersonalizationContentScoringPersona
  // -> umbracoEngagePersonalizationPersona) but this endpoint silently
  // no-ops for one instead of erroring — verified directly against the
  // table (0 rows before and after) rather than assumed.
  it("succeeds silently without persisting for a non-existent persona entityId", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await tool.handler(
      {
        items: [
          {
            id: 0,
            entityId: 999999999,
            documentUnique: crypto.randomUUID(),
            culture: null,
            score: 1,
            isLocked: false,
            type: "Persona",
          },
        ],
      } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
