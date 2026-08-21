import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestAllTool from "../get/get-ab-test-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";

jest.setTimeout(60000);

describe("get-ab-test-all", () => {
  setupTestEnvironment();

  it("lists all A/B tests", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestAllTool.handler({}, context);

    expect(
      normalizeVolatileFields(createSnapshotResult(result)),
    ).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // on this instance that's always an empty list, since every other test in
  // this collection cleans up its own real A/B test via delete-ab-test. That
  // never actually proves the listing reflects real database state. This
  // endpoint takes no filter/pagination params at all (unlike e.g.
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
