import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-profile-sessions.js";

describe("get-profile-sessions", () => {
  setupTestEnvironment();

  it("returns sessions for a non-existent visitorId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ VisitorId: 999999999 } as any, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
