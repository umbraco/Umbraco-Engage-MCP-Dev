import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  SegmentsBuilder,
} from "./setup.js";
import deleteTool from "../delete/delete-segments.js";

describe("delete-segments", () => {
  setupTestEnvironment();

  it("deletes an existing segment", async () => {
    const builder = await new SegmentsBuilder().create();
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
