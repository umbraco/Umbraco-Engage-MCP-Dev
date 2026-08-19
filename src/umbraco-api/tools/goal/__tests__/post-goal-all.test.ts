import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-goal-all.js";

describe("post-goal-all", () => {
  setupTestEnvironment();

  // Despite the POST verb, this is a read-only paged search endpoint (no
  // create side effect) — it filters/paginates over existing goals. Not
  // snapshotted: post-goal.test.ts permanently creates a new goal on every
  // run (no delete-goal endpoint exists), so the row count and contents
  // here grow indefinitely rather than staying fixed.
  it("returns a page of goals", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await tool.handler(
      { page: 1, pageSize: 10 } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(Array.isArray(result.structuredContent.rows)).toBe(true);
    expect(result.structuredContent.totalRowCount).toBeGreaterThanOrEqual(0);
  });
});
