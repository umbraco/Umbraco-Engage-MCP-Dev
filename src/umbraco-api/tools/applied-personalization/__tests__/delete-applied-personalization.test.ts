import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AppliedPersonalizationBuilder,
} from "./setup.js";
import tool from "../delete/delete-applied-personalization.js";

const TEST_NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-applied-personalization", () => {
  setupTestEnvironment();

  it("should delete a created applied personalization", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AppliedPersonalizationBuilder().create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();
  });

  it("should be idempotent when deleting a non-existent applied personalization", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { id: TEST_NONEXISTENT_ID },
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
