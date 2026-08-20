import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestTool from "../get/get-ab-test.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { normalizeAbTestIdentifiers } from "./helpers/normalize-ab-test.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";

// The AbTestBuilder chain (content page + goal + ab-test, each a real
// network round trip through the chained CMS MCP) reliably exceeds Jest's
// default 5000ms per-test timeout under load - matches the same file-level
// override used in ab-test-builder.test.ts.
jest.setTimeout(60000);

// A genuinely persisted A/B test can't be built for this collection (requires
// an existing goal, a configured page, and a second variant beyond the
// default "A" — out of scope). This documents the real, verified behavior for
// a non-existent id instead of forcing a fake happy path.
const TEST_NON_EXISTENT_ID = 999999;

describe("get-ab-test", () => {
  setupTestEnvironment();

  let builder: AbTestBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns a 404 error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestTool.handler(
      { id: TEST_NON_EXISTENT_ID },
      context,
    );

    expect(result.isError).toBe(true);
    const structuredContent = result.structuredContent as { status?: number };
    expect(structuredContent?.status).toBe(404);
  });

  it("returns the real, persisted A/B test for a real id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new AbTestBuilder().create();

    const result = await getAbTestTool.handler(
      { id: builder.getId() },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(
      normalizeAbTestIdentifiers(
        normalizeVolatileFields(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
