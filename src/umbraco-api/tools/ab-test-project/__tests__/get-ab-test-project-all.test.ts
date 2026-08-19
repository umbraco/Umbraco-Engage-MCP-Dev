import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-ab-test-project-all.js";
import { AbTestProjectBuilder } from "./helpers/ab-test-project-builder.js";

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
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
