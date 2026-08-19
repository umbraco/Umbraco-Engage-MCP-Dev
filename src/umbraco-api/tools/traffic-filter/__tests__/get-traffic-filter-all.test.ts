import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-traffic-filter-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-traffic-filter-all", () => {
  setupTestEnvironment();
  it("returns all traffic filter rules", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    // createdByUmbracoUserName on this built-in default rule reflects whichever
    // account performed the *original* Engage install — never reproducible
    // across environments, so normalize it before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
