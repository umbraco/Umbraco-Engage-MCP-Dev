import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../get/get-customer-journey-all.js";

describe("get-customer-journey-all", () => {
  setupTestEnvironment();
  it("returns an array of customer journeys", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: any[] }).items;
    expect(Array.isArray(items)).toBe(true);
  });
});
