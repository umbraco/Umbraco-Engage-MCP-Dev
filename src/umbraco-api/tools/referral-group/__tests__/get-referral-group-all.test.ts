import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ReferralGroupTestHelper,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { ReferralGroupBuilder } from "./helpers/referral-group-builder.js";
import tool from "../get/get-referral-group-all.js";

describe("get-referral-group-all", () => {
  setupTestEnvironment();
  it("returns all referral groups", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(
      normalizeVolatileFields(
        ReferralGroupTestHelper.normalizeIds(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // it never proves the listing genuinely reflects real database state.
  describe("with a real referral group", () => {
    let builder: ReferralGroupBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted referral group in the full list", async () => {
      builder = await new ReferralGroupBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { unique: string }[] }).items;
      expect(items.some((item) => item.unique === builder!.getId())).toBe(true);
    });
  });
});
