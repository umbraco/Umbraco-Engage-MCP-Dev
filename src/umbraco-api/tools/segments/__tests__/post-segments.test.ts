import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-segments.js";
import deleteTool from "../delete/delete-segments.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("post-segments", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  it("creates a new segment", async () => {
    unique = crypto.randomUUID();
    const context = createMockRequestHandlerExtra();

    const result = await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        isTemporary: false,
        sortOrder: 0,
        rules: [],
        controlGroupSize: 0,
      } as any,
      context,
    );

    const snapshot = normalizeVolatileFields(createSnapshotResult(result)) as any;
    if (snapshot?.structuredContent) {
      snapshot.structuredContent.unique = "NORMALIZED_UNIQUE";
    }
    expect(snapshot).toMatchSnapshot();
  });
});
