import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ReferralGroupBuilder,
  ReferralGroupTestHelper,
  TEST_REFERRAL_GROUP_NAME,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-referral-group.js";

const TEST_REFERRAL_GROUP_TITLE = `${TEST_REFERRAL_GROUP_NAME} Get`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-referral-group", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ReferralGroupTestHelper.cleanup(TEST_REFERRAL_GROUP_NAME);
  });

  it("should return an existing referral group by id", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new ReferralGroupBuilder()
      .withName(TEST_REFERRAL_GROUP_TITLE)
      .create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(
      normalizeVolatileFields(
        ReferralGroupTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });

  // Verified empirically: querying a non-existent referral group id returns
  // an error result rather than an empty/default body.
  it("should return an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
