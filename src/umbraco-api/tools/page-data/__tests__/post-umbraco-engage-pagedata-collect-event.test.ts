import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-umbraco-engage-pagedata-collect-event.js";

const TEST_CATEGORY = "Test";
const TEST_ACTION = "Click";

describe("post-umbraco-engage-pagedata-collect-event", () => {
  setupTestEnvironment();

  // Verified empirically: the real server accepts a synthetic event with no
  // corresponding pageview context - it's a fire-and-forget tracking beacon,
  // not a lookup against an existing record. Response is void (empty
  // content, no isError).
  it("collects a custom event and returns void", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        category: TEST_CATEGORY,
        action: TEST_ACTION,
        label: null,
        value: null,
        nonInteraction: false,
        timestamp: new Date().toISOString(),
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
