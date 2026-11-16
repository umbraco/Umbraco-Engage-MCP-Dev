import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AnnotationTestHelper,
  TEST_ANNOTATION_PREFIX,
} from "./setup.js";
import postAnnotationsTool from "../post/post-annotations.js";
import deleteAnnotationsTool from "../delete/delete-annotations.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

const TEST_DESCRIPTION = `${TEST_ANNOTATION_PREFIX} post-annotations`;

describe("post-annotations", () => {
  setupTestEnvironment();

  let createdId: number | undefined;

  afterEach(async () => {
    if (createdId != null) {
      await deleteAnnotationsTool.handler(
        { id: createdId },
        createMockRequestHandlerExtra(),
      );
      createdId = undefined;
    }
  });

  it("creates a new annotation", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAnnotationsTool.handler(
      {
        timestamp: undefined,
        description: TEST_DESCRIPTION,
        createdByUserName: "_test",
        visibility: "Always",
        invalid: false,
        pageVariants: [],
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    createdId = (result.structuredContent as { id?: number } | undefined)?.id;
    expect(createdId).toBeGreaterThan(0);

    const normalized = {
      ...result,
      structuredContent: AnnotationTestHelper.normalizeAnnotation(
        result.structuredContent,
      ),
    };

    expect(
      normalizeVolatileFields(createSnapshotResult(normalized)),
    ).toMatchSnapshot();
  });

  // Regression: the SDK's input sanitiser used to run URL-path checks on every
  // body string, rejecting `?`/`&` in free text. Body strings now only get the
  // control-character check.
  it("accepts '?' and '&' in the free-text description", async () => {
    const description = `${TEST_DESCRIPTION} Q&A? Joost & Co`;

    const result = await postAnnotationsTool.handler(
      {
        timestamp: undefined,
        description,
        createdByUserName: "_test",
        visibility: "Always",
        invalid: false,
        pageVariants: [],
      },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();
    const created = result.structuredContent as { id?: number; description?: string } | undefined;
    createdId = created?.id;
    expect(createdId).toBeGreaterThan(0);
    expect(created?.description).toBe(description);
  });

  it("rejects control characters in the description", async () => {
    const result = await postAnnotationsTool.handler(
      {
        timestamp: undefined,
        description: `${TEST_DESCRIPTION} \u0007bell`,
        createdByUserName: "_test",
        visibility: "Always",
        invalid: false,
        pageVariants: [],
      },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/control character/i);
  });
});
