import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ReferralGroupTestHelper,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
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
});
