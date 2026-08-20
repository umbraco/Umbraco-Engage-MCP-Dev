import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-statistics-total.js";

describe("get-profile-statistics-total", () => {
  setupTestEnvironment();

  it("returns total visitor statistics", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
