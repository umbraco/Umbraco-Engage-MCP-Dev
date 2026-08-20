import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CustomerJourneyBuilder,
  CustomerJourneyTestHelper,
  TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
} from "./setup.js";
import tool from "../delete/delete-customer-journey.js";

const TEST_CUSTOMER_JOURNEY_TITLE = `${TEST_CUSTOMER_JOURNEY_TITLE_PREFIX} Delete`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-customer-journey", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await CustomerJourneyTestHelper.cleanup();
  });

  it("should delete an existing customer journey", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new CustomerJourneyBuilder()
      .withTitle(TEST_CUSTOMER_JOURNEY_TITLE)
      .create();
    const unique = builder.getUnique();

    const result = await tool.handler({ id: unique }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const found = await CustomerJourneyTestHelper.findByTitle(
      TEST_CUSTOMER_JOURNEY_TITLE,
    );
    expect(found).toBeUndefined();
  });

  it("should return isValid: false for non-existent id", async () => {
    // The delete-customer-journey API returns HTTP 200 with a validation
    // result rather than an HTTP error status for a non-existent id.
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as {
      isValid: boolean;
      errors: string[];
    };
    expect(structuredContent.isValid).toBe(false);
    expect(structuredContent.errors.length).toBeGreaterThan(0);
  });
});
