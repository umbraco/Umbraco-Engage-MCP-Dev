import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestPreviewUrlTool from "../get/get-ab-test-preview-url.js";
import getAbTestVariantAllTool from "../../ab-test-variant/get/get-ab-test-variant-all.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
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
const TEST_NON_EXISTENT_AB_TEST_ID = 999999;
const TEST_NON_EXISTENT_VARIANT_ID = 999999;

describe("get-ab-test-preview-url", () => {
  setupTestEnvironment();

  let builder: AbTestBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns a soft not-found errorMessage for a non-existent A/B test id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestPreviewUrlTool.handler(
      {
        abTestId: TEST_NON_EXISTENT_AB_TEST_ID,
        variantId: TEST_NON_EXISTENT_VARIANT_ID,
      },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and a soft
    // { errorMessage, previewUrl: null } body rather than a 404 error.
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("returns a soft \"could not generate preview\" errorMessage for a real, valid, but draft-status variant", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new AbTestBuilder().create();

    const variantAll = await getAbTestVariantAllTool.handler(
      { abTestId: builder.getId() },
      context,
    );
    expect(variantAll.isError).toBeFalsy();
    const variants = (variantAll.structuredContent as { items: { id: number }[] }).items;
    expect(variants.length).toBeGreaterThan(0);
    const realVariantId = variants[0].id;

    const result = await getAbTestPreviewUrlTool.handler(
      { abTestId: builder.getId(), variantId: realVariantId },
      context,
    );

    // Verified empirically: even a real, existing variant on a real,
    // persisted test still returns a soft { errorMessage, previewUrl: null }
    // body (never a hard error) - the test is in "Draft" status (never
    // started), which the server treats the same "can't preview" way as a
    // non-existent id, just with a different message naming the real
    // variant id instead of the test id. That variant id is per-run-random,
    // so it's blanked out of the message before snapshotting.
    expect(result.isError).toBeFalsy();
    const snapshot = normalizeVolatileFields(createSnapshotResult(result)) as {
      structuredContent?: { errorMessage?: string | null };
    };
    if (snapshot.structuredContent?.errorMessage) {
      snapshot.structuredContent.errorMessage = snapshot.structuredContent.errorMessage.replace(
        /variant #\d+/,
        "variant #NORMALIZED_ID",
      );
    }
    expect(snapshot).toMatchSnapshot();
  });
});
