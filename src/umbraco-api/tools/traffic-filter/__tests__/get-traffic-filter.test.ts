import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  TrafficFilterBuilder,
} from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-traffic-filter.js";

describe("get-traffic-filter", () => {
  setupTestEnvironment();

  let builder: TrafficFilterBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
  });

  it("gets a real, persisted traffic filter by its key", async () => {
    builder = await new TrafficFilterBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ key: builder.getKey() }, context);

    expect(result.isError).toBeFalsy();
    const snapshot = normalizeVolatileFields(createSnapshotResult(result)) as {
      structuredContent?: { key: string };
    };
    // `key` is a fresh random guid every run (the builder generates one via
    // crypto.randomUUID()) - not covered by createSnapshotResult's own `id`
    // normalization since the field is named `key`, not `id`.
    if (snapshot.structuredContent) {
      snapshot.structuredContent = {
        ...snapshot.structuredContent,
        key: "00000000-0000-0000-0000-000000000000",
      };
    }
    expect(snapshot).toMatchSnapshot();
  });

  it("returns an error for a non-existent key", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { key: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
