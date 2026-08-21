import {
  setupTestEnvironment,
  ReferralGroupBuilder,
  ReferralGroupTestHelper,
} from "../setup.js";

const NAME = "_Test Referral Group Test Helper";

describe("ReferralGroupTestHelper", () => {
  setupTestEnvironment();

  let builder: ReferralGroupBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await ReferralGroupTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created group", async () => {
    builder = await new ReferralGroupBuilder().withName(NAME).create();

    const all = await ReferralGroupTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((g) => g.unique === builder!.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await ReferralGroupTestHelper.findByName("_Nonexistent Referral Group");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every group matching the given name prefix", async () => {
    builder = await new ReferralGroupBuilder().withName(NAME).create();

    await ReferralGroupTestHelper.cleanup(NAME);

    const found = await ReferralGroupTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks id/unique fields, recursively", () => {
      const input = {
        id: 42,
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        nested: { id: 7, unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae" },
      };

      expect(ReferralGroupTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        nested: { id: 0, unique: "00000000-0000-0000-0000-000000000000" },
      });
    });
  });
});
