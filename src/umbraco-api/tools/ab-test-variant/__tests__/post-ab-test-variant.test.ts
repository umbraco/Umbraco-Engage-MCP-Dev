import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-ab-test-variant.js";

const TEST_NON_EXISTENT_AB_TEST_ID = 999999999;

describe("post-ab-test-variant", () => {
  setupTestEnvironment();

  it("should return an error when the parent A/B test does not exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        abTestId: TEST_NON_EXISTENT_AB_TEST_ID,
        name: "_Test Variant",
        description: undefined,
        redirectNodeKey: undefined,
        css: undefined,
        javascript: undefined,
        created: new Date().toISOString(),
        createdByUmbracoUserKey: crypto.randomUUID(),
        isBenchmark: false,
        disabled: undefined,
        disabledByUmbracoUserKey: undefined,
        isDisabled: false,
        segment: undefined,
        totalPageviewsForVariant: 0,
        totalVisitorsForVariant: 0,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(String(result.structuredContent)).toContain("FOREIGN KEY constraint");
  });
});
