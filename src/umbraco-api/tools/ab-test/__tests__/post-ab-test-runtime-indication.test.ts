import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getEmptyTool from "../get/get-ab-test-empty.js";
import tool from "../post/post-ab-test-runtime-indication.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

// The server's "empty" draft template generates a fresh random `unique` for
// each default variant on every call — blank it wherever it recursively
// appears so the snapshot doesn't drift. Scoped to this test file rather
// than the shared helper since `unique` carries entity-tracking meaning
// elsewhere that a blanket project-wide rule would undermine.
function blankUniques(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(blankUniques);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = key === "unique" && typeof val === "string" ? "NORMALIZED_UNIQUE" : blankUniques(val);
    }
    return out;
  }
  return value;
}

describe("post-ab-test-runtime-indication", () => {
  setupTestEnvironment();

  // Takes a full A/B test object as its body (computed against the payload
  // directly, not looked up by a persisted unique), so the server's own
  // "empty" draft template exercises it without needing a fully-persisted
  // test.
  it("computes a runtime indication for a draft test", async () => {
    const empty: any = await getEmptyTool.handler(
      { testType: "SinglePage" },
      createMockRequestHandlerExtra(),
    );
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(empty.structuredContent.test, context);

    const snapshot = blankUniques(normalizeVolatileFields(createSnapshotResult(result)));
    expect(snapshot).toMatchSnapshot();
  });
});
