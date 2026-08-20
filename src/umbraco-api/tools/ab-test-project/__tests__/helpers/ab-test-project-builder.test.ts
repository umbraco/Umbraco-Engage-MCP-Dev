import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  AbTestProjectBuilder,
  AbTestProjectTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test AB Test Project Builder";

describe("AbTestProjectBuilder", () => {
  setupTestEnvironment();

  let builder: AbTestProjectBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await AbTestProjectTestHelper.cleanup(TEST_NAME);
  });

  it("creates an A/B test project and exposes its id", async () => {
    builder = await new AbTestProjectBuilder()
      .withUnique(randomUUID())
      .withName(TEST_NAME)
      .withDescription(`${TEST_NAME} description`)
      .create();

    expect(builder.getId()).toBeDefined();

    const found = await AbTestProjectTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.unique).toBe(builder.getId());
  });

  it("throws when getId() is called before create()", () => {
    const fresh = new AbTestProjectBuilder();
    expect(() => fresh.getId()).toThrow();
  });

  it("build() returns a snapshot of the current model without creating it", () => {
    const fresh = new AbTestProjectBuilder().withName(TEST_NAME);
    const model = fresh.build();
    expect(model.name).toBe(TEST_NAME);
  });
});
