import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-content-scoring-save.js";

const TEST_NON_EXISTENT_ENTITY_ID = 999999999;
const TEST_DOCUMENT_UNIQUE = "00000000-0000-0000-0000-000000000001";

describe("post-content-scoring-save", () => {
  setupTestEnvironment();

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
});
