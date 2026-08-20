import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getEmptyTool from "../get/get-ab-test-empty.js";
import postTool from "../post/post-ab-test.js";

describe("post-ab-test", () => {
  setupTestEnvironment();

  // A genuinely persisted A/B test requires an existing goal, a configured
  // page, and a second variant beyond the default "A" (see
  // delete-ab-test.test.ts) — out of scope to build here. This documents
  // the tool's real, reliably-reproducible behavior instead: posting the
  // server's own "empty" draft template back unmodified fails server-side
  // validation (missing goal/page) and reports errors without persisting
  // anything, rather than throwing.
  it("reports validation errors for an incomplete draft", async () => {
    const empty: any = await getEmptyTool.handler(
      { testType: "SinglePage" },
      createMockRequestHandlerExtra(),
    );
    const context = createMockRequestHandlerExtra();

    const result = await postTool.handler(empty.structuredContent, context);

    expect(result.isError).toBeFalsy();
    expect((result as any).structuredContent.validationResults.isValid).toBe(false);
  });
});
