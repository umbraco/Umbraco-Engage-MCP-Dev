import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getReportingTool from "../get/get-reporting.js";

const TEST_NON_EXISTENT_SEGMENT_ID = 999999999;

describe("get-reporting", () => {
  setupTestEnvironment();

  // The Zod schema marks segmentId as optional, but the real API 400s when
  // it's omitted entirely - confirmed empirically (same "schema-optional but
  // API-required" pattern seen elsewhere in this session, e.g.
  // content-scoring/get-content-scoring-all). Any real segmentId, even a
  // non-existent one, succeeds with an empty items array.
  it("returns a 400 error when segmentId is omitted despite being marked optional", async () => {
    const context = createMockRequestHandlerExtra();
    // `segmentId` is now required in the tool's own schema (a real MCP
    // caller can no longer omit it) - this still documents the real 400
    // that motivated that change, via a direct handler call that bypasses
    // schema validation.
    const result = await getReportingTool.handler(
      { segmentId: undefined } as unknown as { segmentId: number },
      context,
    );
    expect(result.isError).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("returns reporting rows for a non-existent segmentId", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getReportingTool.handler(
      { segmentId: TEST_NON_EXISTENT_SEGMENT_ID },
      context,
    );
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
