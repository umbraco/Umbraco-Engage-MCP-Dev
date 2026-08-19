import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AppliedPersonalizationBuilder,
} from "./setup.js";
import deleteTool from "../delete/delete-applied-personalization.js";

describe("delete-applied-personalization", () => {
  setupTestEnvironment();

  it("deletes an existing applied personalization", async () => {
    const builder = await new AppliedPersonalizationBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler(
      { id: builder.getUnique() } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
  });

  it("is idempotent for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
