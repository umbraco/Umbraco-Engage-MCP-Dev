import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestVariantCreateTool from "../post/post-ab-test-variant-create.js";
import deleteAbTestVariantTool from "../delete/delete-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestFixture } from "./helpers/ab-test-fixture.js";
import { normalizeAbTestVariantIdentifiers } from "./helpers/normalize-ab-test-variant.js";

jest.setTimeout(60000);

// A non-existent testId case, documented alongside the real happy path
// below.
const TEST_NON_EXISTENT_TEST_ID = 999999999;

describe("post-ab-test-variant-create", () => {
  setupTestEnvironment();

  let abTest: AbTestFixture | undefined;
  let createdVariantId: number | undefined;

  afterEach(async () => {
    if (createdVariantId !== undefined) {
      try {
        await deleteAbTestVariantTool.handler(
          { variantId: createdVariantId },
          createMockRequestHandlerExtra(),
        );
      } catch {
        // ignore cleanup errors
      }
      createdVariantId = undefined;
    }
    if (abTest) await abTest.delete();
    abTest = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns an error when the parent A/B test does not exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantCreateTool.handler(
      { testId: TEST_NON_EXISTENT_TEST_ID },
      context,
    );

    // Verified empirically: the server attempts to INSERT a new default
    // variant row for the given testId and the database rejects it with a
    // FOREIGN KEY constraint violation (HTTP 500), surfaced as an error.
    expect(result.isError).toBe(true);
    expect(String(result.structuredContent)).toContain("FOREIGN KEY constraint");
  });

  it("creates a real, additional variant against a real, persisted parent A/B test", async () => {
    abTest = await new AbTestFixture().create();
    const testId = abTest.getTestId();
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantCreateTool.handler({ testId }, context);

    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as
      | { id: number; unique: string; abTestId: number }
      | undefined;
    if (structuredContent?.id === undefined) {
      throw new Error(`Expected a created variant id: ${JSON.stringify(result)}`);
    }
    createdVariantId = structuredContent.id;

    // Empirically observed (confirms the AbTestVariantBuilder's own
    // findings): the success response shape is the flat variant object
    // itself - id, unique, abTestId at the top level, no nested wrapper -
    // and abTestId matches the real parent test it was created against.
    expect(structuredContent.abTestId).toBe(testId);

    expect(
      normalizeAbTestVariantIdentifiers(
        normalizeVolatileFields(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
