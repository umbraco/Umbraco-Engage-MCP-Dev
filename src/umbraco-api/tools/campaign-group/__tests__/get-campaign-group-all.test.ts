import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { CampaignGroupBuilder } from "./helpers/campaign-group-builder.js";
import tool from "../get/get-campaign-group-all.js";

describe("get-campaign-group-all", () => {
  setupTestEnvironment();
  it("returns all campaign groups", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // it never proves the listing genuinely reflects real database state.
  describe("with a real campaign group", () => {
    let builder: CampaignGroupBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted campaign group in the full list", async () => {
      builder = await new CampaignGroupBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { unique: string }[] }).items;
      expect(items.some((item) => item.unique === builder!.getId())).toBe(true);
    });
  });
});
