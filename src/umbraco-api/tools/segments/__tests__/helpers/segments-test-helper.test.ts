import { setupTestEnvironment, SegmentsBuilder, SegmentsTestHelper } from "../setup.js";

const NAME = "_Test Segment Test Helper";

describe("SegmentsTestHelper", () => {
  setupTestEnvironment();

  let builder: SegmentsBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await SegmentsTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created segment", async () => {
    builder = await new SegmentsBuilder().withName(NAME).create();

    const all = await SegmentsTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((s) => s.unique === builder!.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await SegmentsTestHelper.findByName("_Nonexistent Segment");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every segment matching the given name prefix", async () => {
    builder = await new SegmentsBuilder().withName(NAME).create();

    await SegmentsTestHelper.cleanup(NAME);

    const found = await SegmentsTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks unique/id/segmentId fields, recursively", () => {
      const input = {
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        id: 42,
        name: "Real name",
        rules: [{ id: 7, segmentId: 42, unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae" }],
      };

      expect(SegmentsTestHelper.normalizeIds(input)).toEqual({
        unique: "00000000-0000-0000-0000-000000000000",
        id: 0,
        name: "Real name",
        rules: [{ id: 0, segmentId: 0, unique: "00000000-0000-0000-0000-000000000000" }],
      });
    });
  });
});
