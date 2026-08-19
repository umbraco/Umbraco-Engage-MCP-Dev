import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import deleteSegmentContentTool from "../delete/delete-segments-delete-segment-content.js";

describe("delete-segments-delete-segment-content", () => {
  setupTestEnvironment();

  it("succeeds for a correctly-prefixed segment name", async () => {
    // Engage only allows removing content from segments prefixed with
    // engage_ab-testing_ or engage_personalization_ — any other prefix
    // throws server-side (verified against the live API).
    const context = createMockRequestHandlerExtra();

    const result = await deleteSegmentContentTool.handler(
      {
        segment: "engage_personalization_test",
        contentId: "00000000-0000-0000-0000-000000000000",
      } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({ success: true });
  });

  it("returns an error for a segment name without the required prefix", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteSegmentContentTool.handler(
      {
        segment: "_test-segment",
        contentId: "00000000-0000-0000-0000-000000000000",
      } as any,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
