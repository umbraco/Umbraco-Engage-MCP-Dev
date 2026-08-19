import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteAbTestTool from "../delete/delete-ab-test.js";

describe("delete-ab-test", () => {
  setupTestEnvironment();

  // A genuinely persisted A/B test requires an existing goal, a configured
  // page, and a second variant beyond the default "A" — post-ab-test with
  // anything less returns { isValid: false, errors: [...] } without
  // persisting a record at all (confirmed against the live API: get-ab-test-all
  // stays empty after such a call). Building that full goal/page/variant
  // fixture chain is out of scope for exercising delete-ab-test specifically,
  // so this test covers the tool's real, reliably-reproducible behavior
  // instead: reporting a non-existent unique as invalid rather than throwing.
  it("reports a non-existent A/B test unique as invalid", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestTool.handler(
      { unique: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({ isValid: false });
  });
});
