import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import turnOnTool from "../post/post-main-switch-turn-on.js";
import getMainSwitchTool from "../get/get-main-switch.js";

describe("post-main-switch-turn-on", () => {
  setupTestEnvironment();

  // The main switch defaults to on, so this exercises the idempotent
  // already-on case (see post-main-switch-turn-off.test.ts for the
  // off/restore case).
  it("turns on the main switch", async () => {
    const result = await turnOnTool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();

    const state: any = await getMainSwitchTool.handler({}, createMockRequestHandlerExtra());
    expect(state.structuredContent).toEqual({ on: true });
  });
});
