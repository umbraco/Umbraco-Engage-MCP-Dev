import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-details.js";

const TEST_NON_EXISTENT_VISITOR_ID = 999999999;

describe("get-profile-details", () => {
  setupTestEnvironment();

  it("returns an error for a non-existent visitor id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { visitorId: TEST_NON_EXISTENT_VISITOR_ID },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
