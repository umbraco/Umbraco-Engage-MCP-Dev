import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getContentTypesAllTool from "../get/get-content-types-all.js";

describe("get-content-types-all", () => {
  setupTestEnvironment();

  it("returns all Engage content types", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getContentTypesAllTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
