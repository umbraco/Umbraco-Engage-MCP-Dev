import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../get/get-permissions-document-type-all.js";

describe("get-permissions-document-type-all", () => {
  setupTestEnvironment();
  it("returns an array of document-type permission entries", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: any[] }).items;
    expect(Array.isArray(items)).toBe(true);
  });
});
