import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../delete/delete-content-scoring-journey.js";

const TEST_NON_EXISTENT_ID = 999999999;

describe("delete-content-scoring-journey", () => {
  setupTestEnvironment();

  it(
    "deletes a non-existent journey content scoring entry without erroring",
    async () => {
      const result = await tool.handler(
        { id: TEST_NON_EXISTENT_ID },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBeFalsy();
    },
    15000
  );
});
