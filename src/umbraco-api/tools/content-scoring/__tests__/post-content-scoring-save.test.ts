import { jest } from "@jest/globals";
import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { ContentScoringFixture } from "./helpers/content-scoring-fixture.js";
import tool from "../post/post-content-scoring-save.js";

const TEST_NON_EXISTENT_ENTITY_ID = 999999999;
const TEST_DOCUMENT_UNIQUE = "00000000-0000-0000-0000-000000000001";

jest.setTimeout(60000);

describe("post-content-scoring-save", () => {
  setupTestEnvironment();

  let fixture: ContentScoringFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it(
    "silently no-ops when saving a score for a non-existent persona entity",
    async () => {
      const result = await tool.handler(
        {
          items: [
            {
              id: 0,
              entityId: TEST_NON_EXISTENT_ENTITY_ID,
              documentUnique: TEST_DOCUMENT_UNIQUE,
              culture: null,
              score: 1,
              isLocked: false,
              type: "Persona",
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBeFalsy();
    },
    15000
  );

  // Real success case, exercised via ContentScoringFixture (which internally
  // calls this same tool with a real document + a real persona-segment
  // entityId). ContentScoringFixture.create() itself found and works around
  // a genuine server-side bug: the create response for a persona's nested
  // segment always echoes back id: 0 (not the real persisted id), and
  // passing that fake 0 as entityId with type "Persona" triggers a real
  // NullReferenceException server-side in
  // ContentScoringPersonaRepository.Save - unlike the non-existent-entity
  // test above (a large non-existent id), which the server tolerates
  // gracefully. The real id is only available via a follow-up
  // get-persona-details lookup - see PersonaSegmentBuilder.create().
  it("saves a real content-scoring row for a real document and persona segment", async () => {
    fixture = await new ContentScoringFixture().create();

    // The fixture's own get-content-scoring-all lookup (used internally to
    // resolve the row id for cleanup) already proves the save genuinely
    // persisted - a real, positive row id was found.
    expect(fixture.getRowId()).toBeGreaterThan(0);
  });
});
