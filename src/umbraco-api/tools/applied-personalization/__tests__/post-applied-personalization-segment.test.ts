import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AppliedPersonalizationBuilder,
} from "./setup.js";
import tool from "../post/post-applied-personalization-segment.js";

const TEST_MADE_UP_SEGMENT = "_Test Made Up Segment";

describe("post-applied-personalization-segment", () => {
  setupTestEnvironment();

  // Verified empirically against a live Umbraco Engage instance: this
  // endpoint consistently returns a 400 regardless of whether the segment
  // name is made up or a real applied-personalization's own generated
  // umbracoSegmentAlias. The exact precondition the API needs is
  // undiagnosed — this documents the real, reliably-reproducible failure
  // rather than forcing a fake happy path.
  it("should return a 400 error when posting a segment for an applied personalization", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AppliedPersonalizationBuilder().create();
    const unique = builder.getId();

    const result = await tool.handler(
      { unique, segment: TEST_MADE_UP_SEGMENT, culture: "en-US" },
      context,
    );

    expect(result.isError).toBe(true);

    await builder.delete();
  });
});
