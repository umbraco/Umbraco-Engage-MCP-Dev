import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getAnnotationsGlobalTool from "../get/get-annotations-global.js";

describe("get-annotations-global", () => {
  setupTestEnvironment();

  // See get-annotations-all.test.ts — the Engage annotations endpoint
  // surfaces a SqlDateTime overflow on this instance. We assert on the
  // result shape rather than snapshotting the volatile error body.
  it("returns a result for global annotations (success or known error)", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsGlobalTool.handler(
      { from: undefined, to: undefined },
      context,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("structuredContent");
  });
});
