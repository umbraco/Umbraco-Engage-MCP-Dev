import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-traffic-filter.js";
import deleteTool from "../delete/delete-traffic-filter.js";

describe("post-traffic-filter", () => {
  setupTestEnvironment();

  let key: string | undefined;

  afterEach(async () => {
    if (key) {
      await deleteTool.handler({ key } as any, createMockRequestHandlerExtra());
      key = undefined;
    }
  });

  it("creates a new traffic filter", async () => {
    const context = createMockRequestHandlerExtra();
    const suppliedKey = crypto.randomUUID();

    const result: any = await postTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        key: suppliedKey,
        name: "_Test Traffic Filter",
        description: "test",
        type: "UserAgent",
        mode: "Block",
        condition: "Contains",
        value: "_TestAgent",
        values: ["_TestAgent"],
        isActive: true,
      } as any,
      context,
    );

    // Response is a bare uuid string (the created key) that echoes what we
    // supplied — a fresh random value every run, so a direct equality
    // assertion against our own input is more precise than a snapshot here.
    key = result.structuredContent;

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toBe(suppliedKey);
  });
});
