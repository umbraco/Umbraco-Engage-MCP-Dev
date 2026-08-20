import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PersonaBuilder,
  PersonaTestHelper,
  TEST_PERSONA_NAME,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-persona-details.js";

const TEST_PERSONA_TITLE = `${TEST_PERSONA_NAME} Details`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-persona-details", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PersonaTestHelper.cleanup(TEST_PERSONA_NAME);
  });

  it("should return details for an existing persona", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PersonaBuilder()
      .withTitle(TEST_PERSONA_TITLE)
      .create();
    const unique = builder.getUnique();

    const result = await tool.handler({ id: unique }, context);

    expect(
      normalizeVolatileFields(
        PersonaTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
