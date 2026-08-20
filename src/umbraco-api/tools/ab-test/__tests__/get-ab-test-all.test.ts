import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestAllTool from "../get/get-ab-test-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-ab-test-all", () => {
  setupTestEnvironment();

  it("lists all A/B tests", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestAllTool.handler({}, context);

    expect(
      normalizeVolatileFields(createSnapshotResult(result)),
    ).toMatchSnapshot();
  });
});
