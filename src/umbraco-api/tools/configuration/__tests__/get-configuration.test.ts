import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getConfigurationTool from "../get/get-configuration.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-configuration", () => {
  setupTestEnvironment();

  it("returns Engage configuration", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getConfigurationTool.handler({}, context);
    // reportingTimeZone reflects the *machine's* local timezone (e.g. "W. Europe
    // Standard Time" on the reference machine, "UTC" on a CI runner) — it is
    // never reproducible across environments, so normalize it before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
