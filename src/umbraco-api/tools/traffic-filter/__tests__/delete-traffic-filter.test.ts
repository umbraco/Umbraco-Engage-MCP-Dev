import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  TrafficFilterBuilder,
} from "./setup.js";
import deleteTrafficFilterTool from "../delete/delete-traffic-filter.js";

describe("delete-traffic-filter", () => {
  setupTestEnvironment();

  it("should delete a created traffic filter", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new TrafficFilterBuilder().create();
    const key = builder.getKey();

    const result = await deleteTrafficFilterTool.handler({ key }, context);

    expect(result.isError).toBeFalsy();
  }, 30000);

  it("should return an error when deleting a non-existent key", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteTrafficFilterTool.handler(
      { key: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  }, 15000);
});
