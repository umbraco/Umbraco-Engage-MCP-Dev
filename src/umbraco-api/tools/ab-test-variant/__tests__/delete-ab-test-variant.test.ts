import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import deleteAbTestVariantTool from "../delete/delete-ab-test-variant.js";
import getAbTestVariantTool from "../get/get-ab-test-variant.js";
import getAbTestVariantAllTool from "../get/get-ab-test-variant-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestVariantBuilder } from "./helpers/ab-test-variant-builder.js";

jest.setTimeout(60000);

// A non-existent variantId case, documented alongside the real happy path
// below.
const TEST_NON_EXISTENT_VARIANT_ID = 999999999;

describe("delete-ab-test-variant", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns success rather than throwing for a non-existent variantId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestVariantTool.handler(
      { variantId: TEST_NON_EXISTENT_VARIANT_ID },
      context,
    );

    // Verified empirically: the API responds with HTTP 200 and no body
    // (void endpoint) regardless of whether the variantId exists — so this
    // is not an isError case.
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  it("really deletes a real, persisted variant — it no longer appears afterwards", async () => {
    builder = await new AbTestVariantBuilder().create();
    const variantId = builder.getVariantId();
    const abTestId = builder.getAbTestId();
    const context = createMockRequestHandlerExtra();

    const deleteResult = await deleteAbTestVariantTool.handler({ variantId }, context);
    expect(deleteResult.isError).toBeFalsy();

    // Empirically observed: after a real delete, get-ab-test-variant-all for
    // the parent abTestId no longer lists the deleted variant.
    const allResult = await getAbTestVariantAllTool.handler({ abTestId }, context);
    expect(allResult.isError).toBeFalsy();
    const items =
      (allResult.structuredContent as { items?: { id: number }[] } | undefined)?.items ?? [];
    expect(items.some((item) => item.id === variantId)).toBe(false);

    // Empirically observed: get-ab-test-variant for the now-deleted id
    // behaves exactly like the documented non-existent-id case above — HTTP
    // 200 with an empty body, not a 404/isError.
    const getResult = await getAbTestVariantTool.handler({ id: variantId }, context);
    expect(getResult.isError).toBeFalsy();
    expect(getResult.structuredContent).toBeUndefined();

    // afterEach's builder.delete() below will call delete-ab-test-variant
    // again for this already-deleted variantId. Confirmed harmless: deleting
    // a non-existent variantId succeeds anyway (see the test above), and
    // builder.delete() still goes on to cascade-clean the parent A/B test and
    // content page fine, with no thrown error.
  });
});
