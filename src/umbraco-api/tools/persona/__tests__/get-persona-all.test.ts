import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { PersonaBuilder } from "./helpers/persona-builder.js";
import tool from "../get/get-persona-all.js";

describe("get-persona-all", () => {
  setupTestEnvironment();
  it("returns all personas", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // it never proves the listing genuinely reflects real database state.
  describe("with a real persona", () => {
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
      expect(items.some((item) => item.unique === builder!.getUnique())).toBe(true);
    });
  });
});
