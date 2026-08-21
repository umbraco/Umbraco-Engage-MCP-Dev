import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CustomerJourneyTestHelper,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { CustomerJourneyBuilder } from "./helpers/customer-journey-builder.js";
import tool from "../get/get-customer-journey-all.js";

describe("get-customer-journey-all", () => {
  setupTestEnvironment();

  it("returns an array of customer journeys", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(
      normalizeVolatileFields(
        CustomerJourneyTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });

  // The test above only proves the package-seeded default "Customer
  // Journey" entry is present - it never proves a test-created entity is
  // genuinely reflected in the listing.
  describe("with a real customer journey", () => {
    let builder: CustomerJourneyBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted customer journey in the full list", async () => {
      builder = await new CustomerJourneyBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { unique: string }[] }).items;
      expect(items.some((item) => item.unique === builder!.getUnique())).toBe(true);
    });
  });
});
