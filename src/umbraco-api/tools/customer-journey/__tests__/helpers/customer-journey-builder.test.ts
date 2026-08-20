import {
  setupTestEnvironment,
  CustomerJourneyBuilder,
  CustomerJourneyTestHelper,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
} from "../setup.js";

const TITLE = `${TEST_CUSTOMER_JOURNEY_TITLE_PREFIX} Builder`;

describe("CustomerJourneyBuilder", () => {
  setupTestEnvironment();

  let builder: CustomerJourneyBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await CustomerJourneyTestHelper.cleanup();
  });

  it("creates a customer journey and exposes its server-assigned unique", async () => {
    builder = await new CustomerJourneyBuilder()
      .withTitle(TITLE)
      .withDescription("Created by builder test")
      .create();

    const unique = builder.getUnique();
    expect(unique).toBeDefined();
    expect(unique).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const found = await CustomerJourneyTestHelper.findByTitle(TITLE);
    expect(found).toBeDefined();
    expect(found?.title).toBe(TITLE);
    expect(found?.unique).toBe(unique);
  });

  it("deletes the created customer journey", async () => {
    builder = await new CustomerJourneyBuilder().withTitle(TITLE).create();
    const unique = builder.getUnique();

    await builder.delete();
    builder = undefined;

    const found = await CustomerJourneyTestHelper.findByTitle(TITLE);
    expect(found).toBeUndefined();
    void unique;
  });
});
