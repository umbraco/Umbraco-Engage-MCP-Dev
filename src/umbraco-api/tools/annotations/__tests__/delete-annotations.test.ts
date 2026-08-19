import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AnnotationBuilder,
} from "./setup.js";
import deleteAnnotationsTool from "../delete/delete-annotations.js";

describe("delete-annotations", () => {
  setupTestEnvironment();

  it("deletes an existing annotation", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AnnotationBuilder().create();

    const result = await deleteAnnotationsTool.handler(
      { id: builder.getId() },
      context,
    );

    expect(result.isError).toBeFalsy();
  });

  it("is idempotent for a non-existent annotation id", async () => {
    // Verified against the live API: Engage's delete-annotations endpoint
    // returns success even when nothing matches the given id, rather than
    // a 404 — this asserts that real (idempotent) contract rather than an
    // assumed error response.
    const context = createMockRequestHandlerExtra();

    const result = await deleteAnnotationsTool.handler(
      { id: 999999999 },
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
