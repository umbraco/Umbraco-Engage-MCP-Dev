import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestSegmentTool from "../post/post-ab-test-segment.js";
import getAbTestTool from "../get/get-ab-test.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
import { SegmentContentPageFixture } from "./helpers/segment-content-page-fixture.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";

// The AbTestBuilder chain (content page + goal + ab-test, each a real
// network round trip through the chained CMS MCP) reliably exceeds Jest's
// default 5000ms per-test timeout under load - matches the same file-level
// override used in ab-test-builder.test.ts.
jest.setTimeout(60000);

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent unique instead of forcing a fake happy path.
const TEST_NON_EXISTENT_UNIQUE = "00000000-0000-0000-0000-000000000000";
const TEST_CULTURE = "en-US";
const TEST_SEGMENT = "test-segment";

describe("post-ab-test-segment", () => {
  setupTestEnvironment();

  let builder: AbTestBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns an error for a non-existent unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestSegmentTool.handler(
      {
        unique: TEST_NON_EXISTENT_UNIQUE,
        culture: TEST_CULTURE,
        segment: TEST_SEGMENT,
      },
      context,
    );

    // Verified empirically: a non-existent unique produces a real 400 error
    // rather than the schema's optimistic { created: false }.
    expect(result.isError).toBe(true);
  });

  it("still returns the same generic 400 error for a real test's own unique, its real page key, and its real server-assigned segment value", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new AbTestBuilder().create();

    // Try every combination of "real" input this endpoint could plausibly
    // want, before concluding it's simply unusable in this state:
    //   1. the real, persisted ab-test's own `unique` (as originally assumed)
    //   2. the real content page's `unique` (the semantically more likely
    //      target, matching `get-ab-test-page`'s own `unique` param) paired
    //      with the test's own REAL server-assigned variant segment string
    //      (fetched via get-ab-test, e.g. "engage_ab-testing_93" - not an
    //      arbitrary made-up one)
    //   3. the same, with `culture` omitted entirely
    // Verified empirically: all three still 400 with the exact same generic
    // `{ status: 400, detail: "Bad Request" }` body as a wholly non-existent
    // unique.
    //
    // Root cause CONFIRMED (not a fixture gap, not an ab-test status issue -
    // see next paragraph) by decompiling the real Engage server
    // (Umbraco.Engage.Web.dll, Umbraco.Engage.Web.Api.Controllers.AbTest.
    // CreateSegmentAbTestController -> Umbraco.Engage.Web.UmbracoSegments.
    // UmbracoSegmentService.CreateSegment): the endpoint resolves `unique` as
    // a Document id, then 400s unless that document's content type has
    // segment variation enabled AND has at least one property that varies by
    // segment. ContentPageFixture's document type (used by AbTestBuilder)
    // has neither - see the "returns created: true..." test below for the
    // real success path via SegmentContentPageFixture.
    //
    // Ruled out empirically: the ab-test's own Draft/Running status is NOT
    // the cause. There is no stored `status` column on the AbTest table at
    // all - it's computed from startTime/endTime/isCompleted - and postAbTest
    // is create-only (it always inserts a new row; it does not upsert an
    // existing one by id/unique, confirmed by the returned id/unique/goalId
    // differing from the input on every call). A test created directly with
    // startTime already set (so it computes as "Running" from the moment it
    // exists) still 400s identically against its own real server-assigned
    // segment.
    const abTestUniqueResult = await postAbTestSegmentTool.handler(
      {
        unique: builder.getUnique(),
        culture: TEST_CULTURE,
        segment: TEST_SEGMENT,
      },
      context,
    );
    expect(abTestUniqueResult.isError).toBe(true);

    const abTest = await getAbTestTool.handler({ id: builder.getId() }, context);
    const realSegment = (
      abTest.structuredContent as { variants: { segment: string | null }[] }
    ).variants.find((v) => v.segment)?.segment;
    expect(realSegment).toBeTruthy();

    const pageKeyResult = await postAbTestSegmentTool.handler(
      {
        unique: builder.getPageKey(),
        culture: TEST_CULTURE,
        segment: realSegment ?? TEST_SEGMENT,
      },
      context,
    );
    expect(pageKeyResult.isError).toBe(true);

    const pageKeyNoCultureResult = await postAbTestSegmentTool.handler(
      {
        unique: builder.getPageKey(),
        culture: undefined,
        segment: realSegment ?? TEST_SEGMENT,
      },
      context,
    );
    expect(pageKeyNoCultureResult.isError).toBe(true);

    expect(createSnapshotResult(abTestUniqueResult)).toMatchSnapshot();
  });

  it("returns created: true for a real, published content page whose document type varies by segment", async () => {
    const context = createMockRequestHandlerExtra();
    const fixture = await new SegmentContentPageFixture().create();

    try {
      const result = await postAbTestSegmentTool.handler(
        {
          unique: fixture.getPageKey(),
          culture: undefined,
          segment: TEST_SEGMENT,
        },
        context,
      );

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toEqual({ created: true });
    } finally {
      await fixture.delete();
    }
  });
});
