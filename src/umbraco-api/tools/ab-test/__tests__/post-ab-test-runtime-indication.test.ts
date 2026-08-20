import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestEmptyTool from "../get/get-ab-test-empty.js";
import postAbTestRuntimeIndicationTool from "../post/post-ab-test-runtime-indication.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

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
