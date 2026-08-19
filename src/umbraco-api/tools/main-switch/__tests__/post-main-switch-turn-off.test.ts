import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import turnOffTool from "../post/post-main-switch-turn-off.js";
import turnOnTool from "../post/post-main-switch-turn-on.js";
import getMainSwitchTool from "../get/get-main-switch.js";

describe("post-main-switch-turn-off", () => {
  setupTestEnvironment();

  // This is a single global toggle for the whole Engage instance (not a
  // per-entity resource), so it's restored to "on" — the instance's default
  // state — in a finally block regardless of assertion outcome, to avoid
  // leaving other tests/features on this instance with tracking disabled.
  it("turns off the main switch", async () => {
    try {
      const result = await turnOffTool.handler({}, createMockRequestHandlerExtra());
      expect(createSnapshotResult(result)).toMatchSnapshot();

      const state: any = await getMainSwitchTool.handler({}, createMockRequestHandlerExtra());
      expect(state.structuredContent).toEqual({ on: false });
    } finally {
      await turnOnTool.handler({}, createMockRequestHandlerExtra());
    }
  });
});
