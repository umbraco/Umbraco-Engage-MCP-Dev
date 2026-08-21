import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  TrafficFilterBuilder,
  TrafficFilterTestHelper,
} from "../setup.js";

// Real API calls against a live Umbraco+Engage instance can comfortably
// exceed Jest's 5s default for both the test body and its afterEach hook.
jest.setTimeout(30000);

const NAME = "_Test Traffic Filter Test Helper";

describe("TrafficFilterTestHelper", () => {
  setupTestEnvironment();

  let builder: TrafficFilterBuilder | undefined;

  beforeAll(async () => {
    await TrafficFilterTestHelper.cleanup(NAME);
  });

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await TrafficFilterTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created filter", async () => {
    builder = await new TrafficFilterBuilder().withName(NAME).create();

    const all = await TrafficFilterTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((f) => f.key === builder!.getKey())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await TrafficFilterTestHelper.findByName("_Nonexistent Traffic Filter");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every filter matching the given name prefix", async () => {
    builder = await new TrafficFilterBuilder().withName(NAME).create();

    await TrafficFilterTestHelper.cleanup(NAME);

    const found = await TrafficFilterTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks key/id fields, recursively", () => {
      const input = {
        key: "3781345e-515f-4001-b646-4dae16e3e8a6",
        id: 42,
        name: "Real name",
        nested: { key: "1f3ae040-2913-4918-9d1f-08e91a6000ae", id: 7 },
      };

      expect(TrafficFilterTestHelper.normalizeIds(input)).toEqual({
        key: "00000000-0000-0000-0000-000000000000",
        id: 0,
        name: "Real name",
        nested: { key: "00000000-0000-0000-0000-000000000000", id: 0 },
      });
    });
  });
});
