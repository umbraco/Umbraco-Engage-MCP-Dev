import { jest } from "@jest/globals";
import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import tool from "../get/get-ab-test-variant-all.js";
import { AbTestVariantBuilder } from "./helpers/ab-test-variant-builder.js";
import { normalizeAbTestVariantIdentifiers } from "./helpers/normalize-ab-test-variant.js";

jest.setTimeout(60000);

describe("get-ab-test-variant-all", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns A/B test variants for an unknown test", async () => {
    const result = await tool.handler({ abTestId: undefined }, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  it("lists the real, persisted variant under its real parent abTestId", async () => {
    builder = await new AbTestVariantBuilder().create();
    const abTestId = builder.getAbTestId();
    const variantId = builder.getVariantId();

    const result = await tool.handler({ abTestId }, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    const items =
      (result.structuredContent as { items?: { id: number }[] } | undefined)?.items ?? [];
    // Empirically observed: the real, created variant DOES show up in the
    // list for its real parent abTestId — alongside the parent A/B test's
    // own two default draft variants (a benchmark and "Variant B").
    expect(items.some((item) => item.id === variantId)).toBe(true);

    expect(
      normalizeAbTestVariantIdentifiers(
        normalizeVolatileFields(createSnapshotResult(result)),
      ),
    ).toMatchSnapshot();
  });
});
