import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PersonaBuilder,
} from "./setup.js";
import deleteTool from "../delete/delete-persona.js";

describe("delete-persona", () => {
  setupTestEnvironment();

  it("deletes an existing persona group", async () => {
    const builder = await new PersonaBuilder().create();
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
