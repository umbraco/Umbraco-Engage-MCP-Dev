import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAbTestAllTool from "../get/get-ab-test-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { normalizeAbTestIdentifiers } from "./helpers/normalize-ab-test.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";

jest.setTimeout(60000);

describe("get-ab-test-all", () => {
  setupTestEnvironment();

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  // This endpoint takes no filter/pagination params at all (unlike e.g.
  // post-goal-all), so the only way to test it meaningfully is to create a
  // real test and confirm it's genuinely found in the full list - a plain
  // empty-list snapshot would prove nothing.
  //
  // The full list itself can't be snapshotted directly: delete-ab-test's own
  // real server rule (confirmed empirically) is "Only AbTests with status
  // 'Draft' or 'Scheduled' can be deleted" - once post-ab-test-start/
  // post-ab-test-stop moves a test past Scheduled (Running/Stopped/
  // Completed), it can never be deleted again, so other tests in this
  // collection leave a growing, unpredictable number of permanent real rows
  // on a long-lived/shared instance. Instead, filter the response down to
  // just the one entry this test created and snapshot ITS normalized shape -
  // that's still real snapshot coverage of the response shape, without
  // depending on how many other real tests happen to exist.
  it("finds a real, persisted A/B test in the full list", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await getAbTestAllTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { id: number }[] }).items;
    expect(items.length).toBeGreaterThan(0);

    const found = items.filter((item) => item.id === builder.getId());
    expect(found).toHaveLength(1);

    const singleItemResult = { ...result, structuredContent: { items: found } };
    expect(
      normalizeAbTestIdentifiers(normalizeVolatileFields(createSnapshotResult(singleItemResult))),
    ).toMatchSnapshot();

    await builder.delete();
  });
});
