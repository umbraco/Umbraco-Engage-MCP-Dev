import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  CampaignGroupBuilder,
  CampaignGroupTestHelper,
} from "../setup.js";

const NAME = "_Test Campaign Group Test Helper";

describe("CampaignGroupTestHelper", () => {
  setupTestEnvironment();

  let builder: CampaignGroupBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await CampaignGroupTestHelper.cleanup(NAME);
  });

  it("listAll returns an array including a freshly created group", async () => {
    builder = await new CampaignGroupBuilder().withUnique(randomUUID()).withName(NAME).create();

    const all = await CampaignGroupTestHelper.listAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((g) => g.unique === builder!.getId())).toBe(true);
  });

  it("findByName returns undefined for a name that doesn't exist", async () => {
    const found = await CampaignGroupTestHelper.findByName("_Nonexistent Campaign Group");
    expect(found).toBeUndefined();
  });

  it("cleanup removes every group matching the given name prefix", async () => {
    builder = await new CampaignGroupBuilder().withUnique(randomUUID()).withName(NAME).create();

    await CampaignGroupTestHelper.cleanup(NAME);

    const found = await CampaignGroupTestHelper.findByName(NAME);
    expect(found).toBeUndefined();
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("blanks id/unique/created, recursively", () => {
      const input = {
        id: 42,
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        created: "2026-08-21T14:13:27Z",
        name: "Real name",
        nested: { id: 7 },
      };

      expect(CampaignGroupTestHelper.normalizeIds(input)).toEqual({
        id: 0,
        unique: "00000000-0000-0000-0000-000000000000",
        created: "1970-01-01T00:00:00.000Z",
        name: "Real name",
        nested: { id: 0 },
      });
    });
  });
});
