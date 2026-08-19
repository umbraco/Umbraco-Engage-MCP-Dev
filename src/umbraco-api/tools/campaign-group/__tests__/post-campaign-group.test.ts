import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-campaign-group.js";
import deleteTool from "../delete/delete-campaign-group.js";

describe("post-campaign-group", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  it("creates a new campaign group", async () => {
    unique = crypto.randomUUID();
    const context = createMockRequestHandlerExtra();

    const result = await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        invalid: false,
        campaigns: [],
        customerJourneyScoring: [],
        personaScoring: [],
      } as any,
      context,
    );

    const snapshot = createSnapshotResult(result) as any;
    if (snapshot?.structuredContent) {
      snapshot.structuredContent.unique = "NORMALIZED_UNIQUE";
    }
    expect(snapshot).toMatchSnapshot();
  });
});
