import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-persona-scores.js";

const TEST_NON_EXISTENT_VISITOR_ID = 999999999;

describe("get-profile-persona-scores", () => {
  setupTestEnvironment();

  it("returns an empty list for a non-existent visitor id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { visitorId: TEST_NON_EXISTENT_VISITOR_ID },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
