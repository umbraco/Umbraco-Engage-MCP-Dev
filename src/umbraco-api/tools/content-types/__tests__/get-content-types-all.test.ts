import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getContentTypesAllTool from "../get/get-content-types-all.js";
import { DocumentTypeFixture, disconnectChainedCms } from "./helpers/document-type-fixture.js";

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

  it("returns all Engage content types", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getContentTypesAllTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
