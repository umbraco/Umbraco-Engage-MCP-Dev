import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  CustomerJourneyBuilder,
} from "./setup.js";
import deleteTool from "../delete/delete-customer-journey.js";

describe("delete-customer-journey", () => {
  setupTestEnvironment();

  it("deletes an existing customer journey", async () => {
    const builder = await new CustomerJourneyBuilder().create();
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
