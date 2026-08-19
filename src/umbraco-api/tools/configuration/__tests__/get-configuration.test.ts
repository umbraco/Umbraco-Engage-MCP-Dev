import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getConfigurationTool from "../get/get-configuration.js";

describe("get-configuration", () => {
  setupTestEnvironment();

  it("returns Engage configuration", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getConfigurationTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
