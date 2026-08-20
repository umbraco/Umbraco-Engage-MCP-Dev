import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
  TEST_AB_TEST_PROJECT_NAME,
} from "./setup.js";
import tool from "../get/get-ab-test-project.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_AB_TEST_PROJECT_GET_NAME = `${TEST_AB_TEST_PROJECT_NAME} - get`;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-ab-test-project", () => {
  setupTestEnvironment();

  const builder = new AbTestProjectBuilder()
    .withUnique(randomUUID())
    .withName(TEST_AB_TEST_PROJECT_GET_NAME)
    .withDescription(TEST_AB_TEST_PROJECT_GET_NAME);

  beforeAll(async () => {
    await builder.create();
  });

  afterAll(async () => {
    await builder.delete();
  });

  it("returns an existing A/B test project", async () => {
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

  it("returns a real error for a non-existent id", async () => {
    // Unlike get-ab-test-project-details (which returns an empty HTTP 200
    // for a non-matching id), get-ab-test-project returns a real HTTP 404.
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
  });
});
