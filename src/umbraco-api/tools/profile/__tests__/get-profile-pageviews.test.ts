import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-pageviews.js";

const TEST_NON_EXISTENT_SESSION_ID = 999999999;

describe("get-profile-pageviews", () => {
  setupTestEnvironment();

  it("returns an empty list for a non-existent session id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { sessionId: TEST_NON_EXISTENT_SESSION_ID },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
