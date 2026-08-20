import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getGoalsAllTool from "../get/get-goals-all.js";

describe("get-goals-all", () => {
  setupTestEnvironment();

  // Not snapshotted: post-goal.test.ts (goal collection) permanently adds a
  // new goal on every run (no delete-goal endpoint exists), so this list's
  // contents grow indefinitely rather than staying fixed.
  it("returns all goals", async () => {
    const result: any = await getGoalsAllTool.handler({}, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
  });
});
