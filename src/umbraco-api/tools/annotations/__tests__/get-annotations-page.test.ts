import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  AnnotationTestHelper,
} from "./setup.js";
import getAnnotationsPageTool from "../get/get-annotations-page.js";

describe("get-annotations-page", () => {
  setupTestEnvironment();

  it("returns page annotations for an unknown page", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAnnotationsPageTool.handler(
      {
        unique: "00000000-0000-0000-0000-000000000000",
        from: undefined,
        to: undefined,
        culture: "",
      },
      context,
    );
    expect(result.isError).toBeFalsy();
    const normalized = {
      ...result,
      structuredContent: Array.isArray(result.structuredContent)
        ? result.structuredContent.map((a: any) => AnnotationTestHelper.normalizeAnnotation(a))
        : result.structuredContent,
    };
    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
