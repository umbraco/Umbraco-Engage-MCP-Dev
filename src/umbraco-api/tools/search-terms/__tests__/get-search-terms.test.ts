import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getSearchTermsTool from "../get/get-search-terms.js";

describe("get-search-terms", () => {
  setupTestEnvironment();

  it("returns search terms (no visitor filter)", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getSearchTermsTool.handler({ visitorId: undefined }, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
