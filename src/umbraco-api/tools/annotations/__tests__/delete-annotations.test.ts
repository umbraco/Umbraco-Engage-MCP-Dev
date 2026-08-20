import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AnnotationBuilder,
} from "./setup.js";
import deleteAnnotationsTool from "../delete/delete-annotations.js";

describe("delete-annotations", () => {
  setupTestEnvironment();

  it("should delete a created annotation", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AnnotationBuilder().create();

    const result = await deleteAnnotationsTool.handler(
      { id: builder.getId() },
      context,
    );

    expect(result.isError).toBeFalsy();
  }, 30000);

  it("should succeed silently when deleting a non-existent id (idempotent delete)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAnnotationsTool.handler(
      { id: 999999999 },
      context,
    );

    expect(result.isError).toBeFalsy();
  }, 15000);
});
