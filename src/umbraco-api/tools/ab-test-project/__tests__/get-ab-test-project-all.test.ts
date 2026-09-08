import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-ab-test-project-all.js";
import { AbTestProjectBuilder } from "./helpers/ab-test-project-builder.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-ab-test-project-all", () => {
  setupTestEnvironment();

  const project = new AbTestProjectBuilder();

  beforeAll(async () => {
    await project.create();
  });

  afterAll(async () => {
    await project.delete();
  });

  // The full list is real, unbounded, shared instance state - other
  // real projects (including ones with started/stopped A/B tests that can
  // never be deleted per the server's own rules) can and do persist on a
  // long-lived instance. Filter down to just this fixture's own project so
  // the snapshot only covers what this test controls.
  it("finds this fixture's own project in the full list", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { unique: string }[] }).items;
    const found = items.filter((item) => item.unique === project.getId());
    expect(found).toHaveLength(1);

    // createdByUmbracoUserName reflects the calling API user's own name (the
    // server ignores whatever the builder sends), which varies per
    // environment (e.g. a differently-named API user in CI) — normalize it
    // before snapshotting.
    const singleItemResult = { ...result, structuredContent: { items: found } };
    expect(normalizeVolatileFields(createSnapshotResult(singleItemResult))).toMatchSnapshot();
  });
});
