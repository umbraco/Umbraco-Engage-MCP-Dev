import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-referral-group-visitors.js";

const TEST_AMOUNT_OF_DAYS = 30;

describe("get-referral-group-visitors", () => {
  setupTestEnvironment();

  // This instance has no referral group visitor data — verified empirically
  // that this returns a successful (non-error) response with an empty
  // record rather than an error, both with amountOfDays omitted and with it
  // set to a specific value.
  it("should return visitor counts (empty on an instance with no data)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ amountOfDays: undefined }, context);

    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  it("should return visitor counts scoped to amountOfDays", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { amountOfDays: TEST_AMOUNT_OF_DAYS },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
