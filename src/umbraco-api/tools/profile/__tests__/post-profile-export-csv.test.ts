import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-profile-export-csv.js";

describe("post-profile-export-csv", () => {
  setupTestEnvironment();

  // Same reasoning as post-profile-overview.test.ts — a read-only query,
  // just returning CSV instead of JSON rows.
  it("exports visitor profiles as csv", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { skip: 0, take: 10 } as any,
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
