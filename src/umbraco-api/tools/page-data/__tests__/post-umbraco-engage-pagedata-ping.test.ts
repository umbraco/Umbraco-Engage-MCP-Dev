import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-umbraco-engage-pagedata-ping.js";

describe("post-umbraco-engage-pagedata-ping", () => {
  setupTestEnvironment();
  it("ping endpoint returns successfully", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  }, 15000);
});
