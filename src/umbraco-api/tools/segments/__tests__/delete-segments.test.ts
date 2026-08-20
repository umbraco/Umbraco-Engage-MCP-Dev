import { setupTestEnvironment, createMockRequestHandlerExtra, SegmentsBuilder } from "./setup.js";
import tool from "../delete/delete-segments.js";

describe("delete-segments", () => {
  setupTestEnvironment();

  it("should delete an existing segment by unique id", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new SegmentsBuilder().withName("_Test Segment Delete").create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();
  });

  it("should be idempotent when deleting a non-existent segment", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBeFalsy();
  });
});
