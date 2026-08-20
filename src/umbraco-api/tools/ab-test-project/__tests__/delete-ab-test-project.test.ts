import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import tool from "../delete/delete-ab-test-project.js";

const TEST_AB_TEST_PROJECT_DELETE_NAME = `${TEST_AB_TEST_PROJECT_NAME} - delete`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("delete-ab-test-project", () => {
  setupTestEnvironment();

  it("deletes an existing A/B test project", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new AbTestProjectBuilder()
      .withName(TEST_AB_TEST_PROJECT_DELETE_NAME)
      .create();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

    expect(result.isError).toBeFalsy();

    const found = await AbTestProjectTestHelper.findByName(
      TEST_AB_TEST_PROJECT_DELETE_NAME,
    );
    expect(found).toBeUndefined();
  });

  it("returns a real error for a non-existent id", async () => {
    // Unlike some other collections, delete-ab-test-project is NOT
    // idempotent — deleting a non-existent id returns a real HTTP error.
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
