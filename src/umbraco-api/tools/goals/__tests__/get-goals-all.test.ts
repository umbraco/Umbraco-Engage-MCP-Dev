import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import getGoalsAllTool from "../get/get-goals-all.js";

describe("get-goals-all", () => {
  setupTestEnvironment();
  it("returns all goals", async () => {
    const result = await getGoalsAllTool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
