import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestEmptyTool from "../get/get-ab-test-empty.js";
import postAbTestVariantDetailsTool from "../post/post-ab-test-variant-details.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// Investigated (not added as a permanent test): feeding a real,
// AbTestBuilder-created test's own object (fetched via get-ab-test) into
// this tool instead of get-ab-test-empty's draft produces echoed-back
// differences only (goalValue 1 vs 0, real name/id/unique/segment instead of
// draft placeholders) - no NEW computed behavior. In particular, the one
// field worth checking specifically - `previewUrl` - stays `null` for both
// variants even with a real, published page attached, matching
// get-ab-test-preview-url's own finding that a Draft-status test (which is
// all AbTestBuilder can produce, absent a post-ab-test-start tool) can't
// generate a preview regardless of how real the rest of the test is.

const TEST_TEST_TYPE = "SinglePage" as const;

// Recursively blanks any key literally named `unique` — the response nests
// variant `unique` guids several levels deep, which vary per call. Kept
// local to this test file rather than added to the shared normalizer since
// `unique` carries real tracking meaning elsewhere.
function blankNestedUnique(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(blankNestedUnique);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = key === "unique" ? "NORMALIZED_UNIQUE" : blankNestedUnique(val);
    }
    return out;
  }
  return value;
}

describe("post-ab-test-variant-details", () => {
  setupTestEnvironment();

  it("computes variant details directly against the posted test payload", async () => {
    const context = createMockRequestHandlerExtra();

    const empty = await getAbTestEmptyTool.handler(
      { testType: TEST_TEST_TYPE },
      context,
    );
    const body = (empty.structuredContent as { test: unknown }).test;

    const result = await postAbTestVariantDetailsTool.handler(
      body as any,
      context,
    );

    expect(
      blankNestedUnique(normalizeVolatileFields(createSnapshotResult(result))),
    ).toMatchSnapshot();
  });
});
