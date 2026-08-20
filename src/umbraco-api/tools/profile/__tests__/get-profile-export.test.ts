import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-export.js";

const TEST_SKIP = 0;
const TEST_TAKE = 10;

describe("get-profile-export", () => {
  setupTestEnvironment();

  it("returns an empty export list on a fresh instance", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        Skip: TEST_SKIP,
        Take: TEST_TAKE,
        Order: undefined,
        Ascending: undefined,
        SegmentId: undefined,
        MinimumGoalValue: undefined,
        MinimumCompletedGoals: undefined,
        IsUnidentified: undefined,
        IsIdentified: undefined,
        IsHighPotential: undefined,
        "ActiveRange.From": undefined,
        "ActiveRange.To": undefined,
        IdentifiedName: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
