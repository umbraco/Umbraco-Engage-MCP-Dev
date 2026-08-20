import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PersonaBuilder,
  PersonaTestHelper,
  TEST_PERSONA_NAME,
} from "./setup.js";
import tool from "../delete/delete-persona.js";

const TEST_PERSONA_TITLE = `${TEST_PERSONA_NAME} Delete`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-persona", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PersonaTestHelper.cleanup(TEST_PERSONA_NAME);
  });

  it("should delete an existing persona", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PersonaBuilder()
      .withTitle(TEST_PERSONA_TITLE)
      .create();
    const unique = builder.getUnique();

    const result = await tool.handler({ id: unique }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const found = await PersonaTestHelper.findByName(TEST_PERSONA_TITLE);
    expect(found).toBeUndefined();
  });

  it("should return isValid: false for non-existent id", async () => {
    // The delete-persona API returns HTTP 200 with a validation result
    // rather than an HTTP error status for a non-existent id.
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as {
      isValid: boolean;
      errors: string[];
    };
    expect(structuredContent.isValid).toBe(false);
    expect(structuredContent.errors.length).toBeGreaterThan(0);
  });
});
