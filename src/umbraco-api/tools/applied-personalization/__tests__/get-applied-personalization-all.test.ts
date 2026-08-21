import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { AppliedPersonalizationBuilder } from "./helpers/applied-personalization-builder.js";
import tool from "../get/get-applied-personalization-all.js";

describe("get-applied-personalization-all", () => {
  setupTestEnvironment();
  it("returns all applied personalizations", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // it never proves the listing genuinely reflects real database state.
  describe("with a real applied personalization", () => {
    let builder: AppliedPersonalizationBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted applied personalization in the full list", async () => {
      builder = await new AppliedPersonalizationBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { unique: string }[] }).items;
      expect(items.some((item) => item.unique === builder!.getId())).toBe(true);
    });
  });
});
