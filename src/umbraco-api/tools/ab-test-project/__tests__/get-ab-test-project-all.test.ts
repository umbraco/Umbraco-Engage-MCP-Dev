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

  it("returns all A/B test projects", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    // createdByUmbracoUserName reflects the calling API user's own name (the
    // server ignores whatever the builder sends), which varies per
    // environment (e.g. a differently-named API user in CI) — normalize it
    // before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
