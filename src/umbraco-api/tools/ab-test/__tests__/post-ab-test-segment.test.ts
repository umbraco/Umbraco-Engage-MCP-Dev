import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-ab-test-segment.js";

describe("post-ab-test-segment", () => {
  setupTestEnvironment();

  // Same reasoning as delete-ab-test.test.ts — a genuinely persisted A/B
  // test is out of scope. This documents the tool's real, reliably
  // reproducible behavior for a non-existent test unique: a 400, not the
  // schema's optimistic { created: false }.
  it("returns a 400 for a non-existent A/B test unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        unique: "00000000-0000-0000-0000-000000000000",
        culture: "en-US",
        segment: "_TestSegment",
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
