import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-cockpit-delete-cookie.js";

describe("post-cockpit-delete-cookie", () => {
  setupTestEnvironment();

  it("executes without throwing", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
