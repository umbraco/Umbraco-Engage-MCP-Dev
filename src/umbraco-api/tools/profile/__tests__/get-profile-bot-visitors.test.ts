import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-bot-visitors.js";

describe("get-profile-bot-visitors", () => {
  setupTestEnvironment();

  it("returns bot visitor stats", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
