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

    const result = await tool.handler(
      {
        name: TEST_AB_TEST_PROJECT_POST_NAME,
        description: TEST_AB_TEST_PROJECT_POST_NAME,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    createdId = (result.structuredContent as any)?.unique;

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
