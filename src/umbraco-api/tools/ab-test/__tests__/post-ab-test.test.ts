import { jest } from "@jest/globals";
import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getAbTestEmptyTool from "../get/get-ab-test-empty.js";
import postAbTestTool from "../post/post-ab-test.js";

jest.setTimeout(30000);

describe("post-ab-test", () => {
  setupTestEnvironment();

  it("returns a validation failure for the server's own draft template posted back unmodified", async () => {
    const context = createMockRequestHandlerExtra();

    const empty = await getAbTestEmptyTool.handler(
      { testType: "SinglePage" },
      context
    );

    // A genuinely persisted A/B test requires an existing goal, a configured
    // page, and a second variant beyond the default "A" — posting the empty
    // draft template back unmodified is expected to fail validation without
    // persisting a record. This documents that real, reproducible behavior
    // rather than forcing a fake happy path.
    const result = await postAbTestTool.handler(
      empty.structuredContent as any,
      context
    );

    const structuredContent = result.structuredContent as {
      validationResults?: { isValid?: boolean };
    };
    expect(structuredContent?.validationResults?.isValid).toBe(false);
  });
});
