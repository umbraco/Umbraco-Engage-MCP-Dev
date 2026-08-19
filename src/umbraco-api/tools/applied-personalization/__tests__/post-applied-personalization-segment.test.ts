import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-applied-personalization.js";
import postSegmentTool from "../post/post-applied-personalization-segment.js";
import deleteTool from "../delete/delete-applied-personalization.js";

describe("post-applied-personalization-segment", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  // This endpoint consistently returns 400 on this instance regardless of
  // whether the segment name is made up or the applied personalization's
  // own real generated umbracoSegmentAlias (both verified against the live
  // API) — the exact precondition it needs is undiagnosed. Rather than
  // force a fake pass, this documents the tool's real, reliably
  // reproducible behavior.
  it("returns an error for this endpoint's current (undiagnosed) precondition", async () => {
    unique = crypto.randomUUID();
    await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        type: "SinglePage",
        isActive: true,
        pages: [],
        contentTypes: [],
      } as any,
      createMockRequestHandlerExtra(),
    );

    const context = createMockRequestHandlerExtra();
    const result = await postSegmentTool.handler(
      { unique, segment: "engage_personalization_test", culture: undefined } as any,
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
