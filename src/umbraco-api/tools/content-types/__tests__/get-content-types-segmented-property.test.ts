import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-content-types-segmented-property.js";

describe("get-content-types-segmented-property", () => {
  setupTestEnvironment();

  it("returns segmented property flag for an unknown unique", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler(
      { unique: "00000000-0000-0000-0000-000000000000" },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
