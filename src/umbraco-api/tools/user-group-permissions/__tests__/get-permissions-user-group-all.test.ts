import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../get/get-permissions-user-group-all.js";

describe("get-permissions-user-group-all", () => {
  setupTestEnvironment();
  it("returns an array of user-group permission entries", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: any[] }).items;
    expect(Array.isArray(items)).toBe(true);
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("userGroupAlias");
      expect(items[0]).toHaveProperty("accessToReporting");
    }
  });
});
