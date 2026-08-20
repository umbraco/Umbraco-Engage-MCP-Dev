import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-content-scoring-all.js";

describe("get-content-scoring-all", () => {
  setupTestEnvironment();

  // Verified empirically: the Zod input schema marks `unique` as
  // `.optional()`, but the real API 400s regardless — both when `unique` is
  // omitted AND when a syntactically-valid but non-existent uuid is supplied
  // (same "schema-optional but API-required" mismatch documented on the
  // sibling ab-test/ab-test-page tools; probed with
  // "00000000-0000-0000-0000-000000000000" and got the identical 400). There
  // is no way to make this endpoint return a success response without an
  // actual document's `unique` — out of scope here, since that requires a
  // genuinely existing content-scored document — so only the omitted-unique
  // 400 behavior is documented below, and no second happy-path test is added.
  it("returns a 400 error when unique is omitted despite being marked optional", async () => {
    const result = await tool.handler({ unique: undefined }, createMockRequestHandlerExtra());

    expect(result.isError).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
