import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import postAbTestVariantDisableTool from "../post/post-ab-test-variant-disable.js";
import getAbTestVariantTool from "../get/get-ab-test-variant.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestVariantBuilder } from "./helpers/ab-test-variant-builder.js";
import { normalizeAbTestVariantIdentifiers } from "./helpers/normalize-ab-test-variant.js";

jest.setTimeout(60000);

// A non-existent variantId case, documented alongside the real happy path
// below.
const TEST_NON_EXISTENT_VARIANT_ID = 999999999;

describe("post-ab-test-variant-disable", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns a 404 error for a non-existent variantId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestVariantDisableTool.handler(
      { variantId: TEST_NON_EXISTENT_VARIANT_ID },
      context,
    );

    // Verified empirically: unlike the delete/get endpoints for this
    // resource (which return HTTP 200 with an empty body for a
    // non-existent id), disable returns a genuine HTTP 404.
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      status: 404,
      detail: "Not Found",
    });
  });

  it("really disables a real, persisted variant — isDisabled flips to true afterwards", async () => {
    builder = await new AbTestVariantBuilder().create();
    const variantId = builder.getVariantId();
    const context = createMockRequestHandlerExtra();

    const disableResult = await postAbTestVariantDisableTool.handler({ variantId }, context);
    expect(disableResult.isError).toBeFalsy();

    // Empirically observed: the disable response itself already reflects
    // isDisabled: true.
    expect(
      (disableResult.structuredContent as { isDisabled?: boolean } | undefined)?.isDisabled,
    ).toBe(true);

    expect(
      normalizeAbTestVariantIdentifiers(
        normalizeVolatileFields(createSnapshotResult(disableResult)),
      ),
    ).toMatchSnapshot();

    // Confirmed independently via a follow-up get-ab-test-variant read too.
    const getResult = await getAbTestVariantTool.handler({ id: variantId }, context);
    expect(getResult.isError).toBeFalsy();
    expect(
      (getResult.structuredContent as { isDisabled?: boolean } | undefined)?.isDisabled,
    ).toBe(true);
  });
});
