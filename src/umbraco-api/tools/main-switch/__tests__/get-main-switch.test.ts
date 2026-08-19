import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getMainSwitchTool from "../get/get-main-switch.js";

describe("get-main-switch", () => {
  setupTestEnvironment();

  it("returns the current main-switch state", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getMainSwitchTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
