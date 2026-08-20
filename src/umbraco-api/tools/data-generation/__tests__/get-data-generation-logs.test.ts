import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataGenerationLogsTool from "../get/get-data-generation-logs.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-data-generation-logs", () => {
  setupTestEnvironment();

  it("returns data generation logs", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getDataGenerationLogsTool.handler({}, context);
    // started/finished are background-job timestamps — never reproducible
    // across runs, so normalize them before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
