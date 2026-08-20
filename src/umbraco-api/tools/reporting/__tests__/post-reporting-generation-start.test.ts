import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postReportingGenerationStartTool from "../post/post-reporting-generation-start.js";

describe("post-reporting-generation-start", () => {
  setupTestEnvironment();

  it(
    "starts a reporting generation job",
    async () => {
      const context = createMockRequestHandlerExtra();

      const result = await postReportingGenerationStartTool.handler({}, context);

      expect(result.isError).toBeFalsy();
      expect(createSnapshotResult(result)).toMatchSnapshot();
    },
    30000
  );
});
