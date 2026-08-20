import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-details.js";

describe("get-profile-details", () => {
  setupTestEnvironment();

  it("returns an error for a non-existent visitorId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ visitorId: 999999999 }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
