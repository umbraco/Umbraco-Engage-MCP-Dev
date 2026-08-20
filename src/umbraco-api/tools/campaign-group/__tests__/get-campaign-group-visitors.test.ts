import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-campaign-group-visitors.js";

const TEST_AMOUNT_OF_DAYS = 30;

describe("get-campaign-group-visitors", () => {
  setupTestEnvironment();

  // No visitor data exists on this instance. Empirically, the API returns a
  // 200 with an empty record (`{}`) for any amountOfDays value rather than
  // an error, since there is no per-id lookup involved (unlike
  // get-campaign-group).
  it("returns campaign group visitor counts", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { amountOfDays: TEST_AMOUNT_OF_DAYS },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("returns campaign group visitor counts without an amountOfDays filter", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ amountOfDays: undefined }, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
