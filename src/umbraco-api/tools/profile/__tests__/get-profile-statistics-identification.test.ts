import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-statistics-identification.js";

const TEST_NUMBER_OF_DAYS = 30;

describe("get-profile-statistics-identification", () => {
  setupTestEnvironment();

  it("returns zeroed identification counts on a fresh instance", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { numberOfDays: TEST_NUMBER_OF_DAYS },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
