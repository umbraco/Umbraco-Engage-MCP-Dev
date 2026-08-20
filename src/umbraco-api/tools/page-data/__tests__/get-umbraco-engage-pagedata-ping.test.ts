import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import tool from "../get/get-umbraco-engage-pagedata-ping.js";

describe("get-umbraco-engage-pagedata-ping", () => {
  setupTestEnvironment();

  // Verified empirically: although the generated OpenAPI client exposes a
  // GET variant of this endpoint, the real server only accepts POST for
  // /umbraco/engage/pagedata/ping — the GET variant always 405s. Only the
  // sibling post-umbraco-engage-pagedata-ping tool actually works.
  it("returns a 405 Method Not Allowed - only the POST variant of this endpoint is supported", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());

    expect(result.isError).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
