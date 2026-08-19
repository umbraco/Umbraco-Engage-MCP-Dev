import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataGenerationLogsTool from "../get/get-data-generation-logs.js";

describe("get-data-generation-logs", () => {
  setupTestEnvironment();

  it("returns data generation logs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataGenerationLogsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
