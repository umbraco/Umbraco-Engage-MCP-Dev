import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestRuntimeIndicationTool from "../post/post-ab-test-runtime-indication.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// Investigated (not added as a permanent test): feeding a real,
// AbTestBuilder-created test's own values (baselineConversionRate,
// minimumDetectableEffect, etc., fetched via get-ab-test) into this tool
// instead of the defaults produces no meaningfully different result beyond
// the numbers you'd expect from those inputs changing - this tool is a pure
// calculation with no reference to any real, persisted entity.

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

  it("computes a runtime indication from minimal, caller-meaningful inputs", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestRuntimeIndicationTool.handler(
      {
        testType: "SinglePage",
        participationPercentage: 1,
        minimumDetectableEffect: 0.1,
        estimatedDailyVisitors: 0,
        baselineConversionRate: 0.05,
        variantCount: 2,
      },
      context,
    );

    expect(
      blankNestedUnique(normalizeVolatileFields(createSnapshotResult(result))),
    ).toMatchSnapshot();
  });
});
