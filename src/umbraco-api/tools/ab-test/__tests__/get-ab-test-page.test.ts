import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getAbTestPageTool from "../get/get-ab-test-page.js";

// Although the schema marks `unique` as optional, calling with no params at
// all is verified empirically to also produce a 400 — the API requires a
// real content page unique to list its A/B tests against.
const TEST_NON_EXISTENT_UNIQUE = "00000000-0000-0000-0000-000000000000";

describe("get-ab-test-page", () => {
  setupTestEnvironment();

  it("returns a 400 error for a non-existent page unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestPageTool.handler(
      { unique: TEST_NON_EXISTENT_UNIQUE },
      context,
    );

    expect(result.isError).toBe(true);
    const structuredContent = result.structuredContent as { status?: number };
    expect(structuredContent?.status).toBe(400);
  });

  it("returns a 400 error when no page unique is supplied", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestPageTool.handler(
      { unique: undefined },
      context,
    );

    expect(result.isError).toBe(true);
    const structuredContent = result.structuredContent as { status?: number };
    expect(structuredContent?.status).toBe(400);
  });
});
