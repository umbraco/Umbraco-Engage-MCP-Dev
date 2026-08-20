import {
  setupTestEnvironment,
  PersonaBuilder,
  PersonaTestHelper,
  TEST_PERSONA_NAME,
} from "../setup.js";

const TITLE = `${TEST_PERSONA_NAME} Builder`;

describe("PersonaBuilder", () => {
  setupTestEnvironment();

  let builder: PersonaBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await PersonaTestHelper.cleanup(TEST_PERSONA_NAME);
  });

  it("creates a persona and exposes its server-assigned unique", async () => {
    builder = await new PersonaBuilder().withTitle(TITLE).create();

    expect(builder.getUnique()).toBeDefined();

    const found = await PersonaTestHelper.findByName(TITLE);
    expect(found).toBeDefined();
    expect(found?.title).toBe(TITLE);
    expect(found?.unique).toBe(builder.getUnique());
  });
});
