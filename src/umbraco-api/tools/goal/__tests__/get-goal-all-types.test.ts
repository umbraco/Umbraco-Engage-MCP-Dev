import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-goal-all-types.js";

describe("get-goal-all-types", () => {
  setupTestEnvironment();
  it("returns all goal types", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
