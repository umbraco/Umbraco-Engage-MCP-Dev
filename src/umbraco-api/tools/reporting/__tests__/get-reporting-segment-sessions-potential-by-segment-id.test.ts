import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-reporting-segment-sessions-potential-by-segment-id.js";

describe("get-reporting-segment-sessions-potential-by-segment-id", () => {
  setupTestEnvironment();

  it("returns segment-sessions potential for segmentId=0", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({ segmentId: 0 }, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
