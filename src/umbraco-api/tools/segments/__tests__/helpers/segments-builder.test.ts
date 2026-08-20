import { jest } from "@jest/globals";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import {
  setupTestEnvironment,
  SegmentsBuilder,
  SegmentsTestHelper,
  TEST_SEGMENT_NAME_PREFIX,
} from "../setup.js";

const TEST_NAME = `${TEST_SEGMENT_NAME_PREFIX} Builder`;

// Integration test hitting the real Umbraco instance — the default 5s
// Jest timeout is too tight for create + find + delete round trips.
jest.setTimeout(30000);

describe("SegmentsBuilder", () => {
  setupTestEnvironment();

  let builder: SegmentsBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await SegmentsTestHelper.cleanup(TEST_SEGMENT_NAME_PREFIX);
  });

  it("creates a segment and exposes its unique id and numeric id", async () => {
    builder = await new SegmentsBuilder()
      .withName(TEST_NAME)
      .withDescription("Created by segments-builder.test.ts")
      .create();

    expect(builder.getId()).toBeDefined();
    expect(typeof builder.getId()).toBe("string");
    expect(builder.getNumericId()).toBeGreaterThan(0);

    const found = await SegmentsTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.unique).toBe(builder.getId());
  });

  it("deletes a segment via the builder", async () => {
    builder = await new SegmentsBuilder().withName(TEST_NAME).create();

    await builder.delete();

    const found = await SegmentsTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();
  });

  it("deletes a non-existent segment id idempotently", async () => {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.deleteSegments(
      { id: crypto.randomUUID() },
      CAPTURE_RAW_HTTP_RESPONSE,
    );

    expect(response.status).toBeLessThan(400);
  });
});
