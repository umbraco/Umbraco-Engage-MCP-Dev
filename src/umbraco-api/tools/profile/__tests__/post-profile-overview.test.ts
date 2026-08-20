import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-profile-overview.js";

describe("post-profile-overview", () => {
  setupTestEnvironment();

  it("returns an empty results list on a fresh instance", async () => {
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
