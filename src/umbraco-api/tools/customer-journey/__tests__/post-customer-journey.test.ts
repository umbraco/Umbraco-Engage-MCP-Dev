import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-customer-journey.js";
import deleteTool from "../delete/delete-customer-journey.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("post-customer-journey", () => {
  setupTestEnvironment();

  let unique: string | undefined;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
      unique = undefined;
    }
  });

  it("creates a new customer journey", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await postTool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        steps: [],
      } as any,
      context,
    );

    // The server assigns its own unique — it does not honor the one
    // supplied in the request body (see customer-journey-builder.ts).
    unique = result.structuredContent?.journey?.unique;

    const snapshot = normalizeVolatileFields(createSnapshotResult(result)) as any;
    if (snapshot?.structuredContent?.journey) {
      snapshot.structuredContent.journey.unique = "NORMALIZED_UNIQUE";
    }
    expect(snapshot).toMatchSnapshot();
  });
});
