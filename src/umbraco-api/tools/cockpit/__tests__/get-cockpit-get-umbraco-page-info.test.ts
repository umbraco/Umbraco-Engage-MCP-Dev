import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import tool from "../get/get-cockpit-get-umbraco-page-info.js";

describe("get-cockpit-get-umbraco-page-info", () => {
  setupTestEnvironment();

  it("returns a validation error when culture is omitted", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler(
      { pageId: "00000000-0000-0000-0000-000000000000" } as { pageId: string; culture: string },
      context,
    );
    // Verified empirically: omitting `culture` returns a clean 400 naming
    // the field ("The culture field is required."), while omitting
    // `pageId` (with culture present) instead returns an opaque 403
    // Forbidden - both are genuinely required, just with different failure
    // signatures.
    expect(result.isError).toBe(true);
  });

  it("returns page info for an unknown page", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await tool.handler(
      {
        pageId: "00000000-0000-0000-0000-000000000000",
        culture: "en-US",
      },
      context,
    );
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
