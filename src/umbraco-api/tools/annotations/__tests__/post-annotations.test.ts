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
        id: 0,
        created: new Date().toISOString(),
        timestamp: new Date().toISOString(),
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
});
