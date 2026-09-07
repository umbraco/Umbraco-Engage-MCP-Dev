import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { AppliedPersonalizationBuilder } from "./helpers/applied-personalization-builder.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-applied-personalization-all.js";

describe("get-applied-personalization-all", () => {
  setupTestEnvironment();

  let builder: AppliedPersonalizationBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  it("finds a real, persisted applied personalization in the full list", async () => {
    builder = await new AppliedPersonalizationBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { unique: string }[] }).items;
    const found = items.filter((item) => item.unique === builder!.getId());
    expect(found).toHaveLength(1);

    const singleItemResult = { ...result, structuredContent: { items: found } };
    const snapshot = normalizeVolatileFields(createSnapshotResult(singleItemResult)) as {
      structuredContent?: { items: { unique: string; umbracoSegmentAlias: string }[] };
    };
    // `unique` is a fresh random guid every run (a fixed one would collide
    // with the soft-delete unique constraint on a second run - see the
    // builder), and `umbracoSegmentAlias` embeds the row's own real,
    // server-generated numeric id - neither is covered by
    // normalizeVolatileFields/createSnapshotResult, so blank them manually.
    if (snapshot.structuredContent) {
      snapshot.structuredContent.items = snapshot.structuredContent.items.map((item) => ({
        ...item,
        unique: "00000000-0000-0000-0000-000000000000",
        umbracoSegmentAlias: "NORMALIZED_SEGMENT_ALIAS",
      }));
    }
    expect(snapshot).toMatchSnapshot();
  });
});
