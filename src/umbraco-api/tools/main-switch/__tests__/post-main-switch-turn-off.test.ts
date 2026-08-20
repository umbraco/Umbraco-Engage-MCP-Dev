import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postMainSwitchTurnOffTool from "../post/post-main-switch-turn-off.js";
import postMainSwitchTurnOnTool from "../post/post-main-switch-turn-on.js";
import getMainSwitchTool from "../get/get-main-switch.js";

describe("post-main-switch-turn-off", () => {
  setupTestEnvironment();

  it(
    "turns the main switch off",
    async () => {
      const context = createMockRequestHandlerExtra();

      try {
        const result = await postMainSwitchTurnOffTool.handler({}, context);
        expect(createSnapshotResult(result)).toMatchSnapshot();

        const getResult = await getMainSwitchTool.handler({}, context);
        expect(getResult.structuredContent).toEqual({ on: false });
      } finally {
        await postMainSwitchTurnOnTool.handler({}, context);
      }
    },
    15000,
  );
});
