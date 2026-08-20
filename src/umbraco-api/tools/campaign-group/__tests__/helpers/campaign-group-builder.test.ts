import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  CampaignGroupBuilder,
  CampaignGroupTestHelper,
  TEST_CAMPAIGN_GROUP_PREFIX,
} from "../setup.js";
import deleteTool from "../../delete/delete-campaign-group.js";

const TEST_NAME = `${TEST_CAMPAIGN_GROUP_PREFIX} Builder`;

describe("CampaignGroupBuilder", () => {
  setupTestEnvironment();

  let builder: CampaignGroupBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await CampaignGroupTestHelper.cleanup(TEST_CAMPAIGN_GROUP_PREFIX);
  });

  it("creates a campaign group and exposes its id", async () => {
    builder = await new CampaignGroupBuilder()
      .withUnique(randomUUID())
      .withName(TEST_NAME)
      .withDescription(`${TEST_NAME} description`)
      .create();

    expect(builder.getId()).toBeDefined();

    const found = await CampaignGroupTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.unique).toBe(builder.getId());
  });

  it("honors the client-supplied unique rather than generating a new one", async () => {
    const unique = randomUUID();
    builder = await new CampaignGroupBuilder()
      .withUnique(unique)
      .withName(TEST_NAME)
      .create();

    expect(builder.getId()).toBe(unique);
  });

  it("throws when getId() is called before create()", () => {
    const fresh = new CampaignGroupBuilder();
    expect(() => fresh.getId()).toThrow();
  });

  it("build() returns a snapshot of the current model without creating it", () => {
    const fresh = new CampaignGroupBuilder().withName(TEST_NAME);
    const model = fresh.build();
    expect(model.name).toBe(TEST_NAME);
  });

  // Empirically verified against the real API: deleting a campaign group id
  // that was never created does NOT return an error result — the delete
  // endpoint is idempotent/no-op for unknown ids (unlike some other Engage
  // entities which surface a real error here).
  it("delete-campaign-group on a never-created id does not error", async () => {
    const result = await deleteTool.handler(
      { id: randomUUID() },
      createMockRequestHandlerExtra(),
    );
    expect(result.isError).toBeFalsy();
  });
});
