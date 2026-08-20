import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  CampaignGroupBuilder,
  CampaignGroupTestHelper,
  TEST_CAMPAIGN_GROUP_PREFIX,
} from "./setup.js";
import tool from "../delete/delete-campaign-group.js";

const TEST_NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-campaign-group", () => {
  setupTestEnvironment();

  it("deletes an existing campaign group", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new CampaignGroupBuilder()
      .withName(`${TEST_CAMPAIGN_GROUP_PREFIX} - delete`)
      .create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();

    const all = await CampaignGroupTestHelper.listAll();
    expect(all.some((item: any) => item.unique === id)).toBe(false);
  });

  it("is idempotent when deleting a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NONEXISTENT_ID }, context);

    expect(result.isError).toBeFalsy();
  });
});
