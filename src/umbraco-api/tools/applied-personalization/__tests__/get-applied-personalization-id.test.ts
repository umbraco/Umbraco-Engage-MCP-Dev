import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AppliedPersonalizationBuilder,
} from "./setup.js";
import { AppliedPersonalizationTestHelper } from "./helpers/applied-personalization-test-helper.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-applied-personalization-id.js";

const TEST_NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-applied-personalization-id", () => {
  setupTestEnvironment();

  it("should return the applied personalization by id", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AppliedPersonalizationBuilder().create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(
      normalizeVolatileFields(
        AppliedPersonalizationTestHelper.normalizeIds(createSnapshotResult(result, id)),
      ),
    ).toMatchSnapshot();

    await builder.delete();
  });

  it("should return an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NONEXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
