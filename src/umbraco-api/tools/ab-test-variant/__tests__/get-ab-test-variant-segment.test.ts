import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestVariantSegmentTool from "../get/get-ab-test-variant-segment.js";
import getAbTestVariantTool from "../get/get-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestVariantBuilder } from "./helpers/ab-test-variant-builder.js";
import { normalizeAbTestVariantIdentifiers } from "./helpers/normalize-ab-test-variant.js";

jest.setTimeout(60000);

// A non-existent segment case, documented alongside the real happy path below.
const TEST_NON_EXISTENT_SEGMENT = "_test-non-existent-segment";

describe("get-ab-test-variant-segment", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns a null body rather than throwing for a non-existent segment", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestVariantSegmentTool.handler(
      { segment: TEST_NON_EXISTENT_SEGMENT },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and a literal
    // JSON `null` body for a non-existent segment (not a 404) — so this is
    // not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  it("returns the real, persisted variant for its own real auto-generated segment", async () => {
    builder = await new AbTestVariantBuilder().create();
    const context = createMockRequestHandlerExtra();

    // Read the real variant back to get its own real, server-auto-generated
    // `segment` string (e.g. `engage_ab-testing_<variantId>`) - the value
    // get-ab-test-variant-segment is meant to be queried with.
    const variantResult = await getAbTestVariantTool.handler(
      { id: builder.getVariantId() },
      context,
    );
    expect(variantResult.isError).toBeFalsy();
    const segment = (
      variantResult.structuredContent as { segment?: string | null } | undefined
    )?.segment;
    if (!segment) {
      throw new Error(
        `Expected the real, persisted variant to have a real auto-generated segment: ${JSON.stringify(
          variantResult.structuredContent,
        )}`,
      );
    }

    const result = await getAbTestVariantSegmentTool.handler({ segment }, context);

    // Empirically observed: querying by the variant's own real, auto-
    // generated segment returns that same variant's full record (unlike the
    // non-existent-segment case above, which returns a literal null body).
    expect(result.isError).toBeFalsy();
    expect((result.structuredContent as { id?: number } | undefined)?.id).toBe(
      builder.getVariantId(),
    );

    expect(
      normalizeAbTestVariantIdentifiers(
        normalizeVolatileFields(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
