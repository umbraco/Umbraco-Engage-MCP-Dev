import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  TrafficFilterBuilder,
} from "./setup.js";
import tool from "../get/get-traffic-filter-all.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";

describe("get-traffic-filter-all", () => {
  setupTestEnvironment();
  it("returns all traffic filter rules", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    // createdByUmbracoUserName on this built-in default rule reflects whichever
    // account performed the *original* Engage install — never reproducible
    // across environments, so normalize it before snapshotting.
    expect(normalizeVolatileFields(createSnapshotResult(result))).toMatchSnapshot();
  });

  // The test above only proves the endpoint returns a well-shaped response -
  // it never proves the listing genuinely reflects real database state.
  describe("with a real traffic filter", () => {
    let builder: TrafficFilterBuilder | undefined;

    afterEach(async () => {
      if (builder) await builder.delete();
      builder = undefined;
    });

    it("finds a real, persisted traffic filter in the full list", async () => {
      builder = await new TrafficFilterBuilder().create();
      const context = createMockRequestHandlerExtra();

      const result = await tool.handler({}, context);

      expect(result.isError).toBeFalsy();
      const items = (result.structuredContent as { items: { key: string }[] }).items;
      expect(items.some((item) => item.key === builder!.getKey())).toBe(true);
    });
  });
});
