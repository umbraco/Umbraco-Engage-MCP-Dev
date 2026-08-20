import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../post/post-profile-overview.js";

describe("post-profile-overview", () => {
  setupTestEnvironment();

  // Despite the POST verb, this is a read-only paged search endpoint (no
  // create side effect) — it queries visitor profiles.
  it("returns a page of visitor profiles", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { skip: 0, take: 10 } as any,
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
