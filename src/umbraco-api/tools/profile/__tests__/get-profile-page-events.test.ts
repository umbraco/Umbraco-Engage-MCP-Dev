import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-page-events.js";

const TEST_NON_EXISTENT_PAGEVIEW_ID = 999999999;

describe("get-profile-page-events", () => {
  setupTestEnvironment();

  it("returns an empty list for a non-existent pageview id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { pageviewId: TEST_NON_EXISTENT_PAGEVIEW_ID },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
