import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { PersonaBuilder } from "./helpers/persona-builder.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-persona-all.js";

describe("get-persona-all", () => {
  setupTestEnvironment();

  let builder: PersonaBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  it("finds a real, persisted persona in the full list", async () => {
    builder = await new PersonaBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { unique: string }[] }).items;
    const found = items.filter((item) => item.unique === builder!.getUnique());
    expect(found).toHaveLength(1);

    const singleItemResult = { ...result, structuredContent: { items: found } };
    const snapshot = normalizeVolatileFields(createSnapshotResult(singleItemResult)) as {
      structuredContent?: { items: { unique: string }[] };
    };
    // `unique` is a fresh random guid every run (PersonaBuilder generates one
    // per create()) - not covered by normalizeVolatileFields/
    // createSnapshotResult (which only blanks a field literally named `id`),
    // so blank it manually, same as applied-personalization's equivalent test.
    if (snapshot.structuredContent) {
      snapshot.structuredContent.items = snapshot.structuredContent.items.map((item) => ({
        ...item,
        unique: "00000000-0000-0000-0000-000000000000",
      }));
    }
    expect(snapshot).toMatchSnapshot();
  });
});
