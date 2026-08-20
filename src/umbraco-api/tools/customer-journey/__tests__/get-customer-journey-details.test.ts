import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CustomerJourneyBuilder,
  CustomerJourneyTestHelper,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-customer-journey-details.js";

const TEST_CUSTOMER_JOURNEY_TITLE = `${TEST_CUSTOMER_JOURNEY_TITLE_PREFIX} Details`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-customer-journey-details", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await CustomerJourneyTestHelper.cleanup();
  });

  it("should return details for an existing customer journey", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new CustomerJourneyBuilder()
      .withTitle(TEST_CUSTOMER_JOURNEY_TITLE)
      .create();
    const unique = builder.getUnique();

    const result = await tool.handler({ id: unique }, context);

    expect(
      normalizeVolatileFields(
        CustomerJourneyTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
