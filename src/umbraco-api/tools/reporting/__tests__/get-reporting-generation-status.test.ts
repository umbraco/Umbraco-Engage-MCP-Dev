import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getReportingGenerationStatusTool from "../get/get-reporting-generation-status.js";

describe("get-reporting-generation-status", () => {
  setupTestEnvironment();

  it("returns reporting generation status", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getReportingGenerationStatusTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
