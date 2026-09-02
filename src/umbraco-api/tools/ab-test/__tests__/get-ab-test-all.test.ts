import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getAbTestAllTool from "../get/get-ab-test-all.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";

jest.setTimeout(60000);

describe("get-ab-test-all", () => {
  setupTestEnvironment();

  // Not snapshotted: delete-ab-test's own real server rule (confirmed
  // empirically) is "Only AbTests with status 'Draft' or 'Scheduled' can be
  // deleted" - once post-ab-test-start/post-ab-test-stop move a test past
  // Scheduled (Running/Stopped/Completed), it can never be deleted again.
  // Since this collection's own lifecycle tests genuinely start/stop real
  // tests, this endpoint's list is never reliably empty on a
  // long-lived/shared instance - assert response shape instead.
  it("lists all A/B tests", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestAllTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    expect(Array.isArray((result.structuredContent as { items: unknown[] }).items)).toBe(true);
  });

  // The test above only proves the endpoint returns a well-shaped response.
  // This endpoint takes no filter/pagination params at all (unlike e.g.
  // post-goal-all), so the only way to test it meaningfully is to create a
  // real test and confirm it's genuinely found in the full list.
  describe("with a real A/B test", () => {
    let builder: AbTestBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    afterAll(async () => {
      await disconnectChainedCms();
    }, 30000);

    it("finds a real, persisted A/B test in the full list", async () => {
      builder = await new AbTestBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await getAbTestAllTool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { id: number }[] }).items;
      expect(items.some((item) => item.id === builder!.getId())).toBe(true);
    });
  });
});
