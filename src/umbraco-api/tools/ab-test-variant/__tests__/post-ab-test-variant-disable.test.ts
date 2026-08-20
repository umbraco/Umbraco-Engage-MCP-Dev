import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-ab-test-variant-disable.js";

describe("post-ab-test-variant-disable", () => {
  setupTestEnvironment();

  // Same reasoning as delete-ab-test-variant.test.ts — a genuinely
  // persisted A/B test variant is out of scope. This documents the tool's
  // real, reliably reproducible behavior for a non-existent variantId.
  it("returns an error for a non-existent variantId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ variantId: 999999999 }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
