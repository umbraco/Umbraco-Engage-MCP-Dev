import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-ab-test-variant.js";

describe("post-ab-test-variant", () => {
  setupTestEnvironment();

  // Same reasoning as post-ab-test-variant-create.test.ts — a non-existent
  // abTestId hits the same real FK constraint, so the insert cleanly rolls
  // back with no orphan row.
  it("returns a foreign-key error for a non-existent abTestId", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await tool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        abTestId: 999999999,
        name: "_Test Variant",
        created: new Date().toISOString(),
        createdByUmbracoUserKey: crypto.randomUUID(),
        isBenchmark: false,
        isDisabled: false,
        totalPageviewsForVariant: 0,
        totalVisitorsForVariant: 0,
      } as any,
      context,
    );

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toContain("FOREIGN KEY constraint");
  });
});
