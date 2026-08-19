import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-referral-group.js";
import deleteTool from "../delete/delete-referral-group.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("post-referral-group", () => {
  setupTestEnvironment();

  let unique: string;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
    }
  });

  it("creates a new referral group", async () => {
    unique = crypto.randomUUID();
    const context = createMockRequestHandlerExtra();

    const result = await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique,
        invalid: false,
        pages: [],
        customerJourneyScoring: [],
        personaScoring: [],
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
