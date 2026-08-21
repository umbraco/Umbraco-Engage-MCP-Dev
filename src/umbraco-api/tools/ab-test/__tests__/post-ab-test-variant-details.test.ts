import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestVariantDetailsTool from "../post/post-ab-test-variant-details.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// Investigated (not added as a permanent test): feeding a real,
// AbTestBuilder-created test's own variant names through this tool instead
// of the defaults produces echoed-back differences only (goalValue, real
// name/id/unique/segment) - no NEW computed behavior, and `previewUrl` stays
// `null` regardless (matches get-ab-test-preview-url's own finding that a
// Draft-status test can't generate a preview).

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

  it("computes variant details from minimal, caller-supplied variant names", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantDetailsTool.handler(
      { testType: "SinglePage", variantNames: ["Original", "Variant B"] },
      context,
    );

    expect(
      blankNestedUnique(normalizeVolatileFields(createSnapshotResult(result))),
    ).toMatchSnapshot();
  });
});
