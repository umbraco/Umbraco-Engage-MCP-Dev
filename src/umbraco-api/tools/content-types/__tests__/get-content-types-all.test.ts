import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getContentTypesAllTool from "../get/get-content-types-all.js";
import {
  DocumentTypeFixture,
  disconnectChainedCms,
  TEST_CONTENT_TYPE_ALIAS,
} from "./helpers/document-type-fixture.js";

describe("get-content-types-all", () => {
  setupTestEnvironment();

  const documentType = new DocumentTypeFixture();

  beforeAll(async () => {
    await documentType.create();
  }, 30_000);

  afterAll(async () => {
    await documentType.delete();
    await disconnectChainedCms();
  }, 30_000);

  // The full list is real, unbounded, shared instance state - other
  // collections' fixtures (and any leftover manual testing) can leave other
  // content types in it. Filter down to just this fixture's own alias so the
  // snapshot only covers what this test controls, matching the same fix
  // already applied to get-ab-test-all.
  it("finds this fixture's own content type in the full list", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getContentTypesAllTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { alias: string }[] }).items;
    const found = items.filter((item) => item.alias === TEST_CONTENT_TYPE_ALIAS);
    expect(found).toHaveLength(1);

    const singleItemResult = { ...result, structuredContent: { items: found } };
    expect(createSnapshotResult(singleItemResult)).toMatchSnapshot();
  });
});
