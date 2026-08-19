import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getPackageTool from "../get/get-package.js";

describe("get-package", () => {
  setupTestEnvironment();

  it("returns Umbraco Engage package information", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPackageTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
