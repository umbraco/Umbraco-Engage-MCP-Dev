import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  ReferralGroupBuilder,
  ReferralGroupTestHelper,
  TEST_REFERRAL_GROUP_NAME,
} from "./setup.js";
import tool from "../delete/delete-referral-group.js";

const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-referral-group", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ReferralGroupTestHelper.cleanup(TEST_REFERRAL_GROUP_NAME);
  });

  it("should delete an existing referral group", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new ReferralGroupBuilder()
      .withName(TEST_REFERRAL_GROUP_NAME)
      .create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();

    const found = await ReferralGroupTestHelper.findByName(
      TEST_REFERRAL_GROUP_NAME,
    );
    expect(found).toBeUndefined();
  });

  // Verified empirically: deleting a non-existent referral group id does
  // NOT return an error — the API responds with a 2xx/void success either
  // way, so this call is effectively idempotent from the tool's perspective.
  it("should not error when deleting a non-existent referral group id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBeFalsy();
  });
});
