import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postSegmentsTool from "../post/post-segments.js";
import updatePriorityTool from "../post/post-segments-update-priority.js";
import deleteTool from "../delete/delete-segments.js";

describe("post-segments-update-priority", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  it("updates the sort order for an existing segment", async () => {
    unique = crypto.randomUUID();

    const created: any = await postSegmentsTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        isTemporary: false,
        sortOrder: 0,
        rules: [],
        controlGroupSize: 0,
      } as any,
      createMockRequestHandlerExtra(),
    );

    // The numeric `id` here is the segment's real internal id, distinct from
    // its `unique` guid — required by this endpoint's schema. It gets
    // normalized to a placeholder guid by the SDK's snapshot helper (which
    // blanks any field literally named `id`), so it must be captured from
    // the raw structuredContent before snapshotting.
    const id = created.structuredContent.id;

    const context = createMockRequestHandlerExtra();
    const result = await updatePriorityTool.handler(
      { items: [{ id, sortOrder: 1 }] },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
