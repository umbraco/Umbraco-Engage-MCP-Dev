import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestEmptyTool from "../get/get-ab-test-empty.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_TEST_TYPE = "SinglePage" as const;

// The server generates fresh `unique` guids for this blank draft template on
// every call (verified: not stable across repeated calls) — recursively
// blank any key literally named `unique`. Kept local to this test file since
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

describe("get-ab-test-empty", () => {
  setupTestEnvironment();

  it("returns the blank draft template for a single-page test", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestEmptyTool.handler(
      { testType: TEST_TEST_TYPE },
      context,
    );

    expect(
      blankNestedUnique(normalizeVolatileFields(createSnapshotResult(result))),
    ).toMatchSnapshot();
  });
});
