import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-customer-journey-empty.js";

describe("get-customer-journey-empty", () => {
  setupTestEnvironment();

  it("should return a blank draft customer journey template", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
