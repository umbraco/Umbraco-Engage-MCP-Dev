import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-statistics-total.js";

describe("get-profile-statistics-total", () => {
  setupTestEnvironment();

  it("returns zeroed total counts on a fresh instance", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
