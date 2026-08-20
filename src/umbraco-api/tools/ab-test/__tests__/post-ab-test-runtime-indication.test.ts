import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestEmptyTool from "../get/get-ab-test-empty.js";
import postAbTestRuntimeIndicationTool from "../post/post-ab-test-runtime-indication.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// Investigated (not added as a permanent test): feeding a real,
// AbTestBuilder-created test's own object (fetched via get-ab-test) into
// this tool instead of get-ab-test-empty's draft produces no meaningfully
// different result - `requiredVisitorsTotal`/`requiredVisitorsPerVariant`
// come out numerically IDENTICAL either way (60492/30246), since
// AbTestBuilder doesn't override the draft's default
// baselineConversionRate/minimumDetectableEffect, and this response schema
// has no `previewUrl` field for the real page/variant to populate. The only
// differences observed were the variant `name`/`segment` strings, which are
// pure echoes of whatever was fed in as input (real or draft), not new
// computed behavior. A permanent snapshot of the real-test variant would
// therefore just be testing "the tool echoes back the name I gave it" again
// under a different fixture, not a new code path.

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

describe("post-ab-test-runtime-indication", () => {
  setupTestEnvironment();

  it("computes a runtime indication directly against the posted test payload", async () => {
    const context = createMockRequestHandlerExtra();

    const empty = await getAbTestEmptyTool.handler(
      { testType: TEST_TEST_TYPE },
      context,
    );
    const body = (empty.structuredContent as { test: unknown }).test;

    const result = await postAbTestRuntimeIndicationTool.handler(
      body as any,
      context,
    );

    expect(
      blankNestedUnique(normalizeVolatileFields(createSnapshotResult(result))),
    ).toMatchSnapshot();
  });
});
