import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AnnotationTestHelper,
  TEST_ANNOTATION_PREFIX,
} from "./setup.js";
import postAnnotationsTool from "../post/post-annotations.js";

describe("post-annotations", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await AnnotationTestHelper.cleanupTestAnnotations();
  });

  it("creates a new annotation", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postAnnotationsTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        description: TEST_ANNOTATION_PREFIX,
        createdByUserName: "_test",
        visibility: "Always",
        invalid: false,
        pageVariants: [],
      },
      context,
    );
    const normalized = {
      ...result,
      structuredContent: AnnotationTestHelper.normalizeAnnotation(result.structuredContent),
    };
    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });

  it("returns an error for an invalid visibility value", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await postAnnotationsTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        description: TEST_ANNOTATION_PREFIX,
        createdByUserName: "_test",
        visibility: "NotARealVisibility" as any,
        invalid: false,
        pageVariants: [],
      },
      context,
    );
    expect(result.isError).toBe(true);
  });
});
