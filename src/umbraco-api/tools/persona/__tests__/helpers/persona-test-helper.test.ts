import { setupTestEnvironment, PersonaBuilder, PersonaTestHelper } from "../setup.js";

const TITLE = "_Test Persona Test Helper";

describe("PersonaTestHelper", () => {
  setupTestEnvironment();

  let builder: PersonaBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await PersonaTestHelper.cleanup(TITLE);
  });

  it("listAll returns an array including a freshly created persona", async () => {
    builder = await new PersonaBuilder().withTitle(TITLE).create();

    const all = await PersonaTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((p) => p.unique === builder!.getUnique())).toBe(true);
  });

  it("findByName returns undefined for a title that doesn't exist", async () => {
    const found = await PersonaTestHelper.findByName("_Nonexistent Persona Title");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every persona matching the given title prefix", async () => {
    builder = await new PersonaBuilder().withTitle(TITLE).create();

    await PersonaTestHelper.cleanup(TITLE);

    const found = await PersonaTestHelper.findByName(TITLE);
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

      expect(PersonaTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        title: "Real title",
        nested: { id: 0, unique: "00000000-0000-0000-0000-000000000000" },
      });
    });
  });
});
