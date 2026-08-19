import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getCampaignsTool from "../get/get-campaigns.js";

describe("get-campaigns", () => {
  setupTestEnvironment();

  it("returns campaigns (no visitor filter)", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getCampaignsTool.handler({ visitorId: undefined }, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
