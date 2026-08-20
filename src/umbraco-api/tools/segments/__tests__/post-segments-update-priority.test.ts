import { setupTestEnvironment, createMockRequestHandlerExtra, SegmentsBuilder } from "./setup.js";
import tool from "../post/post-segments-update-priority.js";

describe("post-segments-update-priority", () => {
  setupTestEnvironment();

  it("should update the sort order priority of an existing segment", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new SegmentsBuilder()
      .withName("_Test Segment Update Priority")
      .create();
    const numericId = builder.getNumericId();

    const result = await tool.handler(
      { items: [{ id: numericId, sortOrder: 1 }] },
      context,
    );

    expect(result.isError).toBeFalsy();

    await builder.delete();
  });
});
