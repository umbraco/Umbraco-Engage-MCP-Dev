import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getCulturesTool from "../get/get-cultures.js";

describe("get-cultures", () => {
  setupTestEnvironment();

  it("returns available cultures", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getCulturesTool.handler({ id: undefined }, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
