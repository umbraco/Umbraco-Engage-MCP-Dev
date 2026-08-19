import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAddOnsTool from "../get/get-add-ons.js";

describe("get-add-ons", () => {
  setupTestEnvironment();

  it("returns enabled add-ons", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getAddOnsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
