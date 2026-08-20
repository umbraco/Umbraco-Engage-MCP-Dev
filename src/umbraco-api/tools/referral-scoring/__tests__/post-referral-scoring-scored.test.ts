import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postReferralScoringScoredTool from "../post/post-referral-scoring-scored.js";

const TEST_PAGE = 1;
const TEST_PAGE_SIZE = 10;
const TEST_AMOUNT_OF_DAYS = 30;

describe("post-referral-scoring-scored", () => {
  setupTestEnvironment();

  it("returns a page of scored referrals", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postReferralScoringScoredTool.handler(
      { page: TEST_PAGE, pageSize: TEST_PAGE_SIZE, amountOfDays: TEST_AMOUNT_OF_DAYS },
      context
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
