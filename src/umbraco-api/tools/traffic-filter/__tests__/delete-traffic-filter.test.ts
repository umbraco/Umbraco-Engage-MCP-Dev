import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  TrafficFilterBuilder,
} from "./setup.js";
import deleteTool from "../delete/delete-traffic-filter.js";

describe("delete-traffic-filter", () => {
  setupTestEnvironment();

  it("deletes an existing traffic filter", async () => {
    const builder = await new TrafficFilterBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler(
      { key: builder.getKey() } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
  });

  it("returns an error for a non-existent key", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteTool.handler(
      { key: "00000000-0000-0000-0000-000000000000" } as any,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
