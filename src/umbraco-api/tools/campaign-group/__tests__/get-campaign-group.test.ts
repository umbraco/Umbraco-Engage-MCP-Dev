import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CampaignGroupBuilder,
  CampaignGroupTestHelper,
  TEST_CAMPAIGN_GROUP_PREFIX,
} from "./setup.js";
import tool from "../get/get-campaign-group.js";

const TEST_NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-campaign-group", () => {
  setupTestEnvironment();

  it("returns a campaign group by id", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new CampaignGroupBuilder()
      .withName(`${TEST_CAMPAIGN_GROUP_PREFIX} - get`)
      .create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();

    const normalized = {
      ...result,
      structuredContent: CampaignGroupTestHelper.normalizeIds(
        result.structuredContent,
      ),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();

    await builder.delete();
  });

  it("returns an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NONEXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
