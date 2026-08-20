import { randomUUID } from "crypto";
import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../post/post-umbraco-engage-pagedata-collect.js";

const TEST_VERSION = 1;

describe("post-umbraco-engage-pagedata-collect", () => {
  setupTestEnvironment();

  // Verified empirically: both `version` and `pageviewGuid` are optional per
  // the Zod input schema, and the real server accepts a syntactically-valid
  // but otherwise unregistered pageviewGuid without error - it's a
  // fire-and-forget tracking beacon, not a lookup against an existing
  // pageview record. Response is void (empty content, no isError).
  it("collects page data for a pageview and returns void", async () => {
    const context = createMockRequestHandlerExtra();
    const pageviewGuid = randomUUID();

    const result = await tool.handler({ pageviewGuid, version: TEST_VERSION }, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
