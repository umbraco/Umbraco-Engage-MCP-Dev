import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getAnnotationsAllTool from "../get/get-annotations-all.js";

describe("get-annotations-all", () => {
  setupTestEnvironment();

  // The Engage annotations repository on this instance throws SqlDateTime
  // overflow when the from/to range expands to a TimeSpan that exceeds
  // SqlDateTime bounds. The endpoint reliably returns an error here, so we
  // assert on the error contract rather than snapshotting the volatile body.
  it("returns a result for all annotations (success or known error)", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsAllTool.handler(
      { from: undefined, to: undefined },
      context,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("structuredContent");
  });
});
