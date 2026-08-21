import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-profile-export-csv.js";

// `skip`/`take` in the tool's inputSchema trigger the SDK's
// withStandardDecorators cursor-pagination wrapper, which strips them from
// the exposed schema in favor of an opaque `cursor` param - omit it for
// the first page (see get-data-cleanup-logs.test.ts for the same pattern).
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
        activeFrom: undefined,
        activeTo: undefined,
        identifiedName: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
