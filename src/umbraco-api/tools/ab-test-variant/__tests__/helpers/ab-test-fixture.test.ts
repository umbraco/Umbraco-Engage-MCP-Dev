import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { setupTestEnvironment } from "../setup.js";
import { AbTestFixture, TEST_AB_TEST_VARIANT_FIXTURE_NAME } from "./ab-test-fixture.js";
import { disconnectChainedCms } from "../../../../../testing/content-page-fixture.js";
import getAbTestAllTool from "../../../ab-test/get/get-ab-test-all.js";

// Real dependency chain: a chained-CMS content page + goal-type lookup +
// goal creation + goal-details lookup + post-ab-test - the default 5s Jest
// timeout is far too tight.
jest.setTimeout(60000);

describe("AbTestFixture", () => {
  setupTestEnvironment();

  let fixture: AbTestFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a real, persisted A/B test and exposes its numeric id", async () => {
    fixture = await new AbTestFixture().create();

    expect(typeof fixture.getTestId()).toBe("number");
    expect(fixture.getTestId()).toBeGreaterThan(0);

    const result = await getAbTestAllTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { id: number; name: string | null }[] })
      .items;
    expect(items.some((item) => item.id === fixture!.getTestId())).toBe(true);
  });

  it("throws when getTestId() is called before create()", () => {
    const fresh = new AbTestFixture();
    expect(() => fresh.getTestId()).toThrow();
  });

  it("deletes the created A/B test", async () => {
    fixture = await new AbTestFixture().create();
    const testId = fixture.getTestId();

    await fixture.delete();
    fixture = undefined;

    const result = await getAbTestAllTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { id: number }[] }).items;
    expect(items.some((item) => item.id === testId)).toBe(false);
  });

  // Documents this file's own local duplicate naming, matching the sibling
  // ab-test collection's own convention.
  it("uses the collection-scoped fixture name", () => {
    expect(TEST_AB_TEST_VARIANT_FIXTURE_NAME).toBe("_Test AB Test Variant Fixture Parent");
  });
});
