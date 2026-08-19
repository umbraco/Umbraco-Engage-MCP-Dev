import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getStatisticsTool from "../get/get-statistics.js";

describe("get-statistics", () => {
  setupTestEnvironment();

  it("returns Engage statistics", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getStatisticsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
