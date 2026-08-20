import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import tool from "../get/get-ab-test-project-details.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_AB_TEST_PROJECT_DETAILS_NAME = `${TEST_AB_TEST_PROJECT_NAME} - details`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-ab-test-project-details", () => {
  setupTestEnvironment();

  const builder = new AbTestProjectBuilder()
    .withUnique(randomUUID())
    .withName(TEST_AB_TEST_PROJECT_DETAILS_NAME)
    .withDescription(TEST_AB_TEST_PROJECT_DETAILS_NAME);

  beforeAll(async () => {
    await builder.create();
  });

  afterAll(async () => {
    await builder.delete();
  });

  it("returns details for an existing A/B test project", async () => {
    const context = createMockRequestHandlerExtra();
    const id = builder.getId();

    const result = await tool.handler({ id }, context);

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

  it("returns an empty, non-error result for a non-existent id", async () => {
    // Unlike delete-ab-test-project, the details endpoint responds with an
    // HTTP 200 and no body for an id that doesn't match any project rather
    // than a real error.
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toBeUndefined();
  });
});
