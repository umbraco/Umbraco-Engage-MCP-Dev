import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  TEST_AB_TEST_PROJECT_UNIQUE,
} from "./setup.js";
import putAbTestProjectTool from "../put/put-ab-test-project.js";

describe("put-ab-test-project", () => {
  setupTestEnvironment();

  const project = new AbTestProjectBuilder();

  beforeAll(async () => {
    await project.create();
  });

  afterAll(async () => {
    await project.delete();
  });

  it("updates an existing A/B test project", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await putAbTestProjectTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: TEST_AB_TEST_PROJECT_UNIQUE,
        name: "Updated test project",
        description: "Updated test project",
        createdByUmbracoUserName: "Engage",
        amountOfTests: 0,
        amountOfActiveTests: 0,
        invalid: false,
        archived: false,
        abTests: [],
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
