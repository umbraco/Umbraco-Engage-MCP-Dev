import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-ab-test-variant-create.js";

describe("post-ab-test-variant-create", () => {
  setupTestEnvironment();

  // Same reasoning as delete-ab-test.test.ts/delete-ab-test-variant.test.ts
  // — a genuinely persisted A/B test is out of scope. A non-existent testId
  // hits a real FK constraint (umbracoEngageAbTestingAbTestVariant →
  // umbracoEngageAbTestingAbTest), so the insert cleanly rolls back with no
  // orphan row — verified safe to call repeatedly. Not snapshotted: the raw
  // error body embeds a per-request bearer token and connection id that
  // change every run, so only the stable, identifying substring is
  // asserted.
  it("returns a foreign-key error for a non-existent testId", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await tool.handler({ testId: 999999999 }, context);

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toContain("FOREIGN KEY constraint");
  });
});
