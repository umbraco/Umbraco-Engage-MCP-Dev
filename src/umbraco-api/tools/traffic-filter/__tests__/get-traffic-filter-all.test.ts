import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-traffic-filter-all.js";

describe("get-traffic-filter-all", () => {
  setupTestEnvironment();
  it("returns all traffic filter rules", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
