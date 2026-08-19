import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  TEST_AB_TEST_PROJECT_UNIQUE,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import postAbTestProjectTool from "../post/post-ab-test-project.js";

describe("post-ab-test-project", () => {
  setupTestEnvironment();

  const project = new AbTestProjectBuilder();

  afterEach(async () => {
    await project.delete();
  });

  it("creates a new A/B test project", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestProjectTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: TEST_AB_TEST_PROJECT_UNIQUE,
        name: TEST_AB_TEST_PROJECT_NAME,
        description: TEST_AB_TEST_PROJECT_NAME,
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
