import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  TrafficFilterBuilder,
  TrafficFilterTestHelper,
} from "../setup.js";
import deleteTrafficFilterTool from "../../delete/delete-traffic-filter.js";

// Real API calls against a live Umbraco+Engage instance can comfortably
// exceed Jest's 5s default for both the test body and its afterEach hook.
jest.setTimeout(30000);

const TEST_NAME = "_Test Builder Traffic Filter";

describe("TrafficFilterBuilder", () => {
  setupTestEnvironment();

  let builder: TrafficFilterBuilder | undefined;

  beforeAll(async () => {
    // Clear out any leftovers from a previously interrupted run before we start.
    await TrafficFilterTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await TrafficFilterTestHelper.cleanup(TEST_NAME);
  });

  it("creates a traffic filter and exposes its key", async () => {
    builder = await new TrafficFilterBuilder().withName(TEST_NAME).create();

    expect(builder.getKey()).toBeDefined();
    expect(typeof builder.getKey()).toBe("string");

    const found = await TrafficFilterTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.key).toBe(builder.getKey());
  });

  it("deletes the created traffic filter", async () => {
    builder = await new TrafficFilterBuilder().withName(TEST_NAME).create();
    const key = builder.getKey();

    await builder.delete();
    builder = undefined;

    const all = await TrafficFilterTestHelper.listAll();
    expect(all.some((f) => f.key === key)).toBe(false);
  });

  it("throws when getKey() is called before create()", () => {
    const fresh = new TrafficFilterBuilder();
    expect(() => fresh.getKey()).toThrow();
  });

  it("build() returns a snapshot of the current model without creating it", () => {
    const fresh = new TrafficFilterBuilder().withName(TEST_NAME);
    const model = fresh.build();
    expect(model.name).toBe(TEST_NAME);
  });

  it("deleting a non-existent key returns a real error, not idempotent success", async () => {
    const context = createMockRequestHandlerExtra();
    const nonExistentKey = "00000000-0000-0000-0000-000000000000";

    const result = await deleteTrafficFilterTool.handler(
      { key: nonExistentKey },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
