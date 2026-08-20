import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-profile-export-csv.js";

describe("post-profile-export-csv", () => {
  setupTestEnvironment();

  it("returns a CSV export for the current filter", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        order: undefined,
        ascending: undefined,
        segmentId: undefined,
        minimumGoalValue: undefined,
        minimumCompletedGoals: undefined,
        isUnidentified: undefined,
        isIdentified: undefined,
        isHighPotential: undefined,
        activeRange: undefined,
        identifiedName: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
