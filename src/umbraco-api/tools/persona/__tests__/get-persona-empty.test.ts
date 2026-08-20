import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-persona-empty.js";

describe("get-persona-empty", () => {
  setupTestEnvironment();

  it("should return a blank draft persona template", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({}, context);

    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });
});
