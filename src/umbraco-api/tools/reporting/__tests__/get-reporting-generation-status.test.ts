import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getReportingGenerationStatusTool from "../get/get-reporting-generation-status.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-reporting-generation-status", () => {
  setupTestEnvironment();

  it("returns reporting generation status", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getReportingGenerationStatusTool.handler({}, context);
    expect(result.isError).toBeFalsy();
    // lastGenerated is a background-job timestamp — never reproducible across
    // runs, so normalize it before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
