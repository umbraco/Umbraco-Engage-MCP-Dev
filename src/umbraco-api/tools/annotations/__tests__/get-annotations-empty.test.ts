import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AnnotationTestHelper,
} from "./setup.js";
import getAnnotationsEmptyTool from "../get/get-annotations-empty.js";

describe("get-annotations-empty", () => {
  setupTestEnvironment();

  it("returns an empty annotation template", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsEmptyTool.handler({}, context);
    const normalized = {
      ...result,
      structuredContent: AnnotationTestHelper.normalizeAnnotation(result.structuredContent),
    };
    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
