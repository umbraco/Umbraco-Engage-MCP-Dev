import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-related.js";

const TEST_NON_EXISTENT_MEMBER_ID = "00000000-0000-0000-0000-000000000000";

describe("get-profile-related", () => {
  setupTestEnvironment();

  it("returns an empty list for a non-existent member id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { memberId: TEST_NON_EXISTENT_MEMBER_ID },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
