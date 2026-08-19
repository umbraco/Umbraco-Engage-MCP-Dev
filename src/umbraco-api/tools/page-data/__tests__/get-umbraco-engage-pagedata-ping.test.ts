import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-umbraco-engage-pagedata-ping.js";

describe("get-umbraco-engage-pagedata-ping", () => {
  setupTestEnvironment();
  it("ping endpoint returns successfully", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
