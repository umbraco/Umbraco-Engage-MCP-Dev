import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-applied-personalization-segment.js";

const TEST_NONEXISTENT_SEGMENT = "_Test Made Up Segment";

describe("get-applied-personalization-segment", () => {
  setupTestEnvironment();

  // Verified empirically against a live Umbraco Engage instance: unlike
  // get-applied-personalization-id, this endpoint does not error for an
  // unmatched segment — it returns a successful, empty (null) result.
  it("should return a null result for a non-existent segment", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ segment: TEST_NONEXISTENT_SEGMENT }, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
