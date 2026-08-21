import {
  setupTestEnvironment,
  CustomerJourneyBuilder,
  CustomerJourneyTestHelper,
} from "../setup.js";

const TITLE = "_Test Customer Journey Test Helper";

describe("CustomerJourneyTestHelper", () => {
  setupTestEnvironment();

  let builder: CustomerJourneyBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await CustomerJourneyTestHelper.cleanup(TITLE);
  });

  it("listAll returns an array including a freshly created journey", async () => {
    builder = await new CustomerJourneyBuilder().withTitle(TITLE).create();

    const all = await CustomerJourneyTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((j) => j.unique === builder!.getUnique())).toBe(true);
  });

  it("findByTitle returns undefined for a title that doesn't exist", async () => {
    const found = await CustomerJourneyTestHelper.findByTitle("_Nonexistent Journey Title");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every journey matching the given title prefix", async () => {
    builder = await new CustomerJourneyBuilder().withTitle(TITLE).create();

    await CustomerJourneyTestHelper.cleanup(TITLE);

    const found = await CustomerJourneyTestHelper.findByTitle(TITLE);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks id/unique fields, recursively", () => {
      const input = {
        id: 42,
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        title: "Real title",
        nested: { id: 7, unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae" },
      };

      expect(CustomerJourneyTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        title: "Real title",
        nested: { id: 0, unique: "00000000-0000-0000-0000-000000000000" },
      });
    });
  });
});
