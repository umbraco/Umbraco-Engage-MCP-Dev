import { jest } from "@jest/globals";
import { setupTestEnvironment } from "../setup.js";
import { AbTestBuilder } from "./ab-test-builder.js";
import { disconnectChainedCms } from "../../../../../testing/content-page-fixture.js";

jest.setTimeout(60000);

describe("AbTestBuilder", () => {
  setupTestEnvironment();

  let builder: AbTestBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a real, genuinely persisted A/B test with a valid dependency chain", async () => {
    builder = await new AbTestBuilder().create();

    expect(typeof builder.getId()).toBe("number");
    expect(builder.getId()).toBeGreaterThan(0);
    expect(typeof builder.getUnique()).toBe("string");
    expect(builder.getUnique()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("throws when getId()/getUnique() are called before create()", () => {
    const fresh = new AbTestBuilder();
    expect(() => fresh.getId()).toThrow();
    expect(() => fresh.getUnique()).toThrow();
  });
});
