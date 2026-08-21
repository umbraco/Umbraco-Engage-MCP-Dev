import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
} from "../setup.js";

const NAME = "_Test AB Test Project Test Helper";

describe("AbTestProjectTestHelper", () => {
  setupTestEnvironment();

  let builder: AbTestProjectBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await AbTestProjectTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created project", async () => {
    builder = await new AbTestProjectBuilder()
      .withUnique(randomUUID())
      .withName(NAME)
      .create();

    const all = await AbTestProjectTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((p) => p.unique === builder!.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await AbTestProjectTestHelper.findByName("_Nonexistent Project Name");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every project matching the given name prefix", async () => {
    builder = await new AbTestProjectBuilder()
      .withUnique(randomUUID())
      .withName(NAME)
      .create();

    await AbTestProjectTestHelper.cleanup(NAME);

    const found = await AbTestProjectTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks id and unique fields, recursively", () => {
      const input = {
        id: 42,
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        nested: { id: 7, unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae" },
      };

      expect(AbTestProjectTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        nested: { id: 0, unique: "00000000-0000-0000-0000-000000000000" },
      });
    });

    it("recurses into arrays", () => {
      const input = [{ id: 1 }, { id: 2 }];
      expect(AbTestProjectTestHelper.normalizeIds(input)).toEqual([{ id: 0 }, { id: 0 }]);
    });
  });
});
