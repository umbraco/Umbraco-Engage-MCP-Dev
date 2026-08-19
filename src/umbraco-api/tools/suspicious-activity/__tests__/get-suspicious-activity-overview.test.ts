import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getSuspiciousActivityOverviewTool from "../get/get-suspicious-activity-overview.js";

describe("get-suspicious-activity-overview", () => {
  setupTestEnvironment();

  it("returns suspicious activity overview", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getSuspiciousActivityOverviewTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
