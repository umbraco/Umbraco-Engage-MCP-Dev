import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-umbraco-engage-pagedata-collect-event.js";

describe("post-umbraco-engage-pagedata-collect-event", () => {
  setupTestEnvironment();

  // Same reasoning as post-umbraco-engage-pagedata-collect.test.ts — this is
  // real front-end analytics tracking with no corresponding delete endpoint.
  it("collects a tracking event", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        category: "_TestCategory",
        action: "_TestAction",
        label: "_TestLabel",
        value: 1,
        nonInteraction: true,
        timestamp: new Date().toISOString(),
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
