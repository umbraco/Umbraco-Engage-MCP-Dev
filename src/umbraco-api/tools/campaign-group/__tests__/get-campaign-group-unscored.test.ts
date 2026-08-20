import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-campaign-group-unscored.js";

describe("get-campaign-group-unscored", () => {
  setupTestEnvironment();

  // This tool takes no input parameters, so there is no invalid-input error
  // path to test. Empirically, on an instance with no unscored campaign
  // group data, the API returns a 200 with an empty array (wrapped as
  // `{ items: [] }` by the tool) rather than an error.
  it("returns unscored campaign groups", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
