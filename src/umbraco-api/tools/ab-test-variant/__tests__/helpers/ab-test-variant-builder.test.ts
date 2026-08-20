import { jest } from "@jest/globals";
import { setupTestEnvironment } from "../setup.js";
import { AbTestVariantBuilder } from "./ab-test-variant-builder.js";
import { disconnectChainedCms } from "../../../../../testing/content-page-fixture.js";

jest.setTimeout(60000);

describe("AbTestVariantBuilder", () => {
  setupTestEnvironment();

  let builder: AbTestVariantBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a real, genuinely persisted A/B test variant attached to a real parent A/B test", async () => {
    builder = await new AbTestVariantBuilder().create();

    expect(typeof builder.getVariantId()).toBe("number");
    expect(builder.getVariantId()).toBeGreaterThan(0);
    expect(typeof builder.getVariantUnique()).toBe("string");
    expect(builder.getVariantUnique()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(builder.getAbTestId()).toBeGreaterThan(0);
  });

  it("throws when getVariantId()/getVariantUnique()/getAbTestId() are called before create()", () => {
    const fresh = new AbTestVariantBuilder();
    expect(() => fresh.getVariantId()).toThrow();
    expect(() => fresh.getVariantUnique()).toThrow();
    expect(() => fresh.getAbTestId()).toThrow();
  });
});
