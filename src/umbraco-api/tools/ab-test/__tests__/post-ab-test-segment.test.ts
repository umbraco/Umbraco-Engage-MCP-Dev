import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestSegmentTool from "../post/post-ab-test-segment.js";
import getAbTestTool from "../get/get-ab-test.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
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
    // unique - this is real behavior, not a fixture gap. The most likely
    // cause (unconfirmed, since it can't be tested via this MCP's tools
    // alone): the endpoint requires the ab-test to be "Running", and
    // AbTestBuilder's tests are always created in "Draft" status - there is
    // no post-ab-test-start tool in this collection to move it out of Draft.
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
});
