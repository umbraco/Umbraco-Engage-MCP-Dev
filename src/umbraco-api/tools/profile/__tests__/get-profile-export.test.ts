import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-export.js";

describe("get-profile-export", () => {
  setupTestEnvironment();

  it("returns an empty export when no profiles exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ Skip: 0, Take: 10 } as any, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
