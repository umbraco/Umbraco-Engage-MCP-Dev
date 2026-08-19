import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-umbraco-engage-pagedata-collect.js";

describe("post-umbraco-engage-pagedata-collect", () => {
  setupTestEnvironment();

  // This is the real front-end analytics tracking pixel — each call records
  // a pageview against this pageviewGuid. There's no delete endpoint for
  // analytics data, so this permanently adds a row (accepted — this demo
  // instance's database is periodically recycled).
  it("collects a pageview", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { version: 1, pageviewGuid: crypto.randomUUID() },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
