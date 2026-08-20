import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postMainSwitchTurnOnTool from "../post/post-main-switch-turn-on.js";
import postMainSwitchTurnOffTool from "../post/post-main-switch-turn-off.js";
import getMainSwitchTool from "../get/get-main-switch.js";

describe("post-main-switch-turn-on", () => {
  setupTestEnvironment();

  it(
    "turns the main switch on",
    async () => {
      const context = createMockRequestHandlerExtra();

      // The main switch is global, mutable state shared across the whole
      // Umbraco instance, and every other test collection assumes it's ON.
      // It should already be on before this test runs. If it isn't, that's a
      // pre-existing issue unrelated to this tool - note it and continue.
      const initialState = await getMainSwitchTool.handler({}, context);
      const wasOn = initialState.structuredContent?.on === true;
      if (!wasOn) {
        console.warn(
          "main-switch was already off before post-main-switch-turn-on test started - this is a pre-existing state issue.",
        );
      }

      try {
        // Turn it off first (only if it was on) so there is a real off -> on
        // transition to exercise, then turn it back on and verify.
        if (wasOn) {
          await postMainSwitchTurnOffTool.handler({}, context);
        }

        const result = await postMainSwitchTurnOnTool.handler({}, context);
        expect(createSnapshotResult(result)).toMatchSnapshot();

        const getResult = await getMainSwitchTool.handler({}, context);
        expect(getResult.structuredContent).toEqual({ on: true });
      } finally {
        // Guarantee the switch is left ON regardless of pass/fail above.
        await postMainSwitchTurnOnTool.handler({}, context);
      }
    },
    15000,
  );
});
