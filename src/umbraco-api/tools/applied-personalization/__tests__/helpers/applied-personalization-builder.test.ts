import {
  setupTestEnvironment,
  AppliedPersonalizationBuilder,
  AppliedPersonalizationTestHelper,
  TEST_APPLIED_PERSONALIZATION_PREFIX,
} from "../setup.js";

const NAME = `${TEST_APPLIED_PERSONALIZATION_PREFIX} Builder`;

describe("AppliedPersonalizationBuilder", () => {
  setupTestEnvironment();

  let builder: AppliedPersonalizationBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await AppliedPersonalizationTestHelper.cleanup(TEST_APPLIED_PERSONALIZATION_PREFIX);
  });

  it("creates an applied personalization and exposes its unique id", async () => {
    builder = await new AppliedPersonalizationBuilder()
      .withName(NAME)
      .withDescription("Test description")
      .create();

    expect(builder.getId()).toBeDefined();
    expect(typeof builder.getId()).toBe("string");

    const found = await AppliedPersonalizationTestHelper.findByName(NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(NAME);
    expect(found?.unique).toBe(builder.getId());
  });

  it("creates a fresh unique per create() call, even when reusing a builder instance", async () => {
    builder = await new AppliedPersonalizationBuilder().withName(NAME).create();
    const firstUnique = builder.getId();

    await builder.delete();
    builder = undefined;

    const secondBuilder = await new AppliedPersonalizationBuilder().withName(NAME).create();
    try {
      expect(secondBuilder.getId()).not.toBe(firstUnique);
    } finally {
      await secondBuilder.delete();
    }
  });
});
