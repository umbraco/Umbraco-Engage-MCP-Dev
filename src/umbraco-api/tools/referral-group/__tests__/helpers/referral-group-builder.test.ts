import {
  setupTestEnvironment,
  ReferralGroupBuilder,
  ReferralGroupTestHelper,
  TEST_REFERRAL_GROUP_NAME,
} from "../setup.js";

const NAME = `${TEST_REFERRAL_GROUP_NAME} Builder`;

describe("ReferralGroupBuilder", () => {
  setupTestEnvironment();

  let builder: ReferralGroupBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await ReferralGroupTestHelper.cleanup(TEST_REFERRAL_GROUP_NAME);
  });

  it("creates a referral group and exposes its id", async () => {
    builder = await new ReferralGroupBuilder().withName(NAME).create();

    expect(builder.getId()).toBeDefined();

    const found = await ReferralGroupTestHelper.findByName(NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(NAME);
    expect(found?.unique).toBe(builder.getId());
  });
});
