import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-bot-visitors.js";

describe("get-profile-bot-visitors", () => {
  setupTestEnvironment();

  it("returns the bot visitors map", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
