import {
  setupTestEnvironment,
  AppliedPersonalizationBuilder,
  AppliedPersonalizationTestHelper,
} from "../setup.js";

const NAME = "_Test Applied Personalization Test Helper";

describe("AppliedPersonalizationTestHelper", () => {
  setupTestEnvironment();

  let builder: AppliedPersonalizationBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await AppliedPersonalizationTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created item", async () => {
    builder = await new AppliedPersonalizationBuilder().withName(NAME).create();

    const all = await AppliedPersonalizationTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((p) => p.unique === builder!.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await AppliedPersonalizationTestHelper.findByName("_Nonexistent Name");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every item matching the given name prefix", async () => {
    builder = await new AppliedPersonalizationBuilder().withName(NAME).create();

    await AppliedPersonalizationTestHelper.cleanup(NAME);

    const found = await AppliedPersonalizationTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks id/unique/umbracoSegmentAlias, recursively", () => {
      const input = {
        id: 42,
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        umbracoSegmentAlias: "some-real-alias",
        name: "Real name",
        nested: { id: 7 },
      };

      expect(AppliedPersonalizationTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        umbracoSegmentAlias: "NORMALIZED_SEGMENT_ALIAS",
        name: "Real name",
        nested: { id: 0 },
      });
    });
  });
});
