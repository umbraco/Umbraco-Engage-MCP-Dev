import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-reporting-generation-start.js";

describe("post-reporting-generation-start", () => {
  setupTestEnvironment();

  it("starts report generation", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
