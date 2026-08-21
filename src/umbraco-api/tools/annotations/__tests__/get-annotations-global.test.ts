import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getAnnotationsGlobalTool from "../get/get-annotations-global.js";

describe("get-annotations-global", () => {
  setupTestEnvironment();

  it("returns an error when from/to are omitted (SqlDateTime overflow on this instance)", async () => {
    const context = createMockRequestHandlerExtra();
    // `from`/`to` are now required in the tool's own schema (a real MCP
    // caller can no longer omit them) - this still documents the real
    // server-side bug that motivated that change, via a direct handler
    // call that bypasses schema validation.
    const result = await getAnnotationsGlobalTool.handler(
      { from: undefined, to: undefined } as unknown as { from: string; to: string },
      context,
    );

    // Verified independently of get-annotations-all.test.ts via direct
    // probe: omitting from/to on this endpoint also deterministically
    // returns a 500 with a SqlDateTime overflow .NET stack trace body on
    // this instance. Real, reproducible server behavior — not
    // flakiness — so we assert the error contract explicitly. The stack
    // trace body itself is not snapshotted since its exact content is
    // non-deterministic across .NET/Engage versions.
    expect(result.isError).toBe(true);
  });

  it("returns global annotations for a real from/to range", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsGlobalTool.handler(
      { from: "2020-01-01T00:00:00.000Z", to: new Date().toISOString() },
      context,
    );

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items?: unknown[] } | undefined)?.items;
    expect(Array.isArray(items)).toBe(true);

    // Same accumulation caveat as get-annotations-all.test.ts: annotation
    // rows accumulate on this shared instance with no guaranteed count, so
    // a full-array snapshot would be brittle. Assert shape instead.
    for (const item of items as Record<string, unknown>[]) {
      expect(item).toMatchObject({
        id: expect.any(Number),
        created: expect.any(String),
        timestamp: expect.any(String),
        description: expect.any(String),
        createdByUserName: expect.any(String),
        visibility: expect.any(String),
        invalid: expect.any(Boolean),
        pageVariants: expect.any(Array),
      });
    }
  });
});
