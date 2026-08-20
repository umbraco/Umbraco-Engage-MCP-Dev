import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import tool from "../put/put-ab-test-project.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_AB_TEST_PROJECT_PUT_NAME = `${TEST_AB_TEST_PROJECT_NAME} - put`;
const TEST_AB_TEST_PROJECT_PUT_UPDATED_NAME = `${TEST_AB_TEST_PROJECT_PUT_NAME} - updated`;

describe("put-ab-test-project", () => {
  setupTestEnvironment();

  const builder = new AbTestProjectBuilder()
    .withUnique(randomUUID())
    .withName(TEST_AB_TEST_PROJECT_PUT_NAME)
    .withDescription(TEST_AB_TEST_PROJECT_PUT_NAME);

  beforeAll(async () => {
    await builder.create();
  });

  afterAll(async () => {
    await builder.delete();
  });

  it("updates the name of an existing A/B test project", async () => {
    const context = createMockRequestHandlerExtra();
    const id = builder.getId();
    const built = builder.build();

    const result = await tool.handler(
      {
        id: built.id,
        created: built.created,
        unique: id,
        name: TEST_AB_TEST_PROJECT_PUT_UPDATED_NAME,
        description: TEST_AB_TEST_PROJECT_PUT_UPDATED_NAME,
        createdByUmbracoUserName: built.createdByUmbracoUserName,
        amountOfTests: built.amountOfTests,
        amountOfActiveTests: built.amountOfActiveTests,
        invalid: built.invalid,
        archived: built.archived,
        abTests: built.abTests,
      },
      context,
    );

    expect(result.isError).toBeFalsy();

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
