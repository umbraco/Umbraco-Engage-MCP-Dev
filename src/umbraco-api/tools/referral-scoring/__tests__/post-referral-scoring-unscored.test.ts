import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-referral-scoring-unscored.js";

describe("post-referral-scoring-unscored", () => {
  setupTestEnvironment();

  // Same reasoning as post-referral-scoring-scored.test.ts — a read-only
  // paged search, not a create.
  it("returns a page of unscored referrals", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { page: 1, pageSize: 10, amountOfDays: 30 },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
