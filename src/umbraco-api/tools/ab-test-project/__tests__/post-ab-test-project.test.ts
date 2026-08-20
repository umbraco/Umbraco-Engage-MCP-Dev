import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import tool from "../post/post-ab-test-project.js";
import deleteTool from "../delete/delete-ab-test-project.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_AB_TEST_PROJECT_POST_NAME = `${TEST_AB_TEST_PROJECT_NAME} - post`;

describe("post-ab-test-project", () => {
  setupTestEnvironment();

  let createdId: string | undefined;

  afterEach(async () => {
    if (createdId) {
      await deleteTool.handler(
        { id: createdId },
        createMockRequestHandlerExtra(),
      );
      createdId = undefined;
    }
  });

  it("creates a new A/B test project", async () => {
    const context = createMockRequestHandlerExtra();
    const TEST_UNIQUE = randomUUID();

    const result = await tool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: TEST_UNIQUE,
        name: TEST_AB_TEST_PROJECT_POST_NAME,
        description: TEST_AB_TEST_PROJECT_POST_NAME,
        createdByUmbracoUserName: "Engage",
        amountOfTests: 0,
        amountOfActiveTests: 0,
        invalid: false,
        archived: false,
        abTests: [],
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    createdId = (result.structuredContent as any)?.unique ?? TEST_UNIQUE;

    const normalized = {
      ...result,
      structuredContent: AbTestProjectTestHelper.normalizeIds(
        result.structuredContent,
      ),
    };

    expect(
      normalizeVolatileFields(createSnapshotResult(normalized)),
    ).toMatchSnapshot();
  });
});
