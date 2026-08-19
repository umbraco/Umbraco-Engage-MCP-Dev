import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-applied-personalization.js";
import deleteTool from "../delete/delete-applied-personalization.js";

describe("post-applied-personalization", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  it("creates a new applied personalization", async () => {
    unique = crypto.randomUUID();
    const context = createMockRequestHandlerExtra();

    const result = await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        type: "SinglePage",
        isActive: true,
        pages: [],
        contentTypes: [],
      } as any,
      context,
    );

    const snapshot = createSnapshotResult(result) as any;
    // A fresh random `unique` is used each run (delete-applied-personalization
    // appears to be a soft delete — reusing a fixed unique across separate
    // runs hits a SQL unique-constraint violation on create). id and
    // umbracoSegmentAlias are both derived from the same site-wide
    // auto-increment counter. None of the three are reproducible across
    // runs/environments, so normalize all three before snapshotting.
    if (snapshot?.structuredContent) {
      snapshot.structuredContent.unique = "NORMALIZED_UNIQUE";
      snapshot.structuredContent.id = 0;
      snapshot.structuredContent.umbracoSegmentAlias = "NORMALIZED_SEGMENT_ALIAS";
    }
    expect(snapshot).toMatchSnapshot();
  });
});
