import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-referral-scoring-scored.js";

describe("post-referral-scoring-scored", () => {
  setupTestEnvironment();

  // Despite the POST verb, this is a read-only paged search endpoint (no
  // create side effect) — it queries referral groups that have scored
  // referrals within a day window.
  it("returns a page of scored referrals", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { page: 1, pageSize: 10, amountOfDays: 30 },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
