import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-sessions.js";

const TEST_NON_EXISTENT_VISITOR_ID = 999999999;
const TEST_PAGE_INDEX = 0;
const TEST_PAGE_SIZE = 10;

describe("get-profile-sessions", () => {
  setupTestEnvironment();

  it("returns an empty results list for a non-existent visitor id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        visitorId: TEST_NON_EXISTENT_VISITOR_ID,
        pageIndex: TEST_PAGE_INDEX,
        pageSize: TEST_PAGE_SIZE,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
