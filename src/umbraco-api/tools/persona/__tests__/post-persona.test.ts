import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postTool from "../post/post-persona.js";
import deleteTool from "../delete/delete-persona.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("post-persona", () => {
  setupTestEnvironment();

  let unique: string | undefined;

  afterEach(async () => {
    if (unique) {
      await deleteTool.handler({ id: unique } as any, createMockRequestHandlerExtra());
      unique = undefined;
    }
  });

  it("creates a new persona group", async () => {
    const context = createMockRequestHandlerExtra();

    const result: any = await postTool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        personas: [],
        minimumDeviationType: "Absolute",
        expirationType: "never",
      } as any,
      context,
    );

    // The server assigns its own unique — it does not honor the one
    // supplied in the request body (see persona-builder.ts).
    unique = result.structuredContent?.persona?.unique;

    const snapshot = normalizeVolatileFields(createSnapshotResult(result)) as any;
    // A freshly-generated unique varies every run — normalize it too,
    // same reasoning as createdOn/createdByUmbracoUserKey above.
    if (snapshot?.structuredContent?.persona) {
      snapshot.structuredContent.persona.unique = "NORMALIZED_UNIQUE";
    }
    expect(snapshot).toMatchSnapshot();
  });
});
