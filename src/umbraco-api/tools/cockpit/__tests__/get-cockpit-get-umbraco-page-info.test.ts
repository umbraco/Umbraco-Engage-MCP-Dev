import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-cockpit-get-umbraco-page-info.js";

describe("get-cockpit-get-umbraco-page-info", () => {
  setupTestEnvironment();

  it("returns page info for an unknown page", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler(
      {
        pageId: "00000000-0000-0000-0000-000000000000",
        culture: "en-US",
      },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
