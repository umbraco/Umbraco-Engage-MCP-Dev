import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getAnnotationsAllTool from "../get/get-annotations-all.js";

describe("get-annotations-all", () => {
  setupTestEnvironment();

  it("returns an error when from/to are omitted (SqlDateTime overflow on this instance)", async () => {
    const context = createMockRequestHandlerExtra();
    // `from`/`to` are now required in the tool's own schema (a real MCP
    // caller can no longer omit them) - this still documents the real
    // server-side bug that motivated that change, via a direct handler
    // call that bypasses schema validation.
    const result = await getAnnotationsAllTool.handler(
      { from: undefined, to: undefined } as unknown as { from: string; to: string },
      context,
    );

    // Confirmed via direct probe: omitting from/to causes the Engage
    // annotations repository on this instance to compute a TimeSpan that
    // overflows SqlDateTime bounds, and the endpoint deterministically
    // returns a 500 with a .NET stack trace body. This is real,
    // reproducible server behavior, not flakiness — so we assert the error
    // contract explicitly rather than the vague "toBeDefined()" check this
    // test used to have. The stack trace body itself is not snapshotted
    // since its exact content (line numbers, assembly paths) is
    // non-deterministic across .NET/Engage versions.
    expect(result.isError).toBe(true);
  });

  it("returns annotations for a real from/to range", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsAllTool.handler(
      { from: "2020-01-01T00:00:00.000Z", to: new Date().toISOString() },
      context,
    );

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items?: unknown[] } | undefined)?.items;
    expect(Array.isArray(items)).toBe(true);

    // Annotation rows accumulate on this shared instance across test runs
    // (other tests/builders create and clean up their own rows, but rows
    // can also pre-exist from earlier sessions), so there is no guaranteed
    // count. A full-array snapshot would be brittle and re-recording it
    // would just drift again on the next run — so we assert on the shape
    // of whatever rows are present instead of snapshotting the array.
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
