import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { SegmentsBuilder } from "./helpers/segments-builder.js";
import tool from "../get/get-segments-all.js";

describe("get-segments-all", () => {
  setupTestEnvironment();
  it("returns all segments", async () => {
    const result = await tool.handler(
      { isTemporary: undefined, amountOfDays: undefined },
      createMockRequestHandlerExtra(),
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response
  // with no filters applied - it never proves a test-created entity is
  // genuinely reflected in the listing, nor that isTemporary actually
  // filters (as opposed to being silently ignored, always passed as
  // undefined). Verified empirically: isTemporary genuinely narrows results
  // (a temporary and a permanent segment created side by side are correctly
  // isolated by isTemporary:true/false respectively) - use it to scope the
  // query down to exactly our own test segment.
  describe("with a real temporary segment", () => {
    let builder: SegmentsBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted segment via isTemporary, proving the filter genuinely narrows results", async () => {
      builder = await new SegmentsBuilder().withIsTemporary(true).create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler(
        { isTemporary: true, amountOfDays: undefined },
        context,
      );

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { unique: string; isTemporary: boolean }[] }).items;
      expect(items.every((item) => item.isTemporary === true)).toBe(true);
      expect(items.some((item) => item.unique === builder!.getId())).toBe(true);
    });
  });
});
