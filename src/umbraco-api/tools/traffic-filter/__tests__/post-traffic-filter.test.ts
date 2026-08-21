import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  TEST_TRAFFIC_FILTER_NAME,
} from "./setup.js";
import postTrafficFilterTool from "../post/post-traffic-filter.js";
import deleteTrafficFilterTool from "../delete/delete-traffic-filter.js";

describe("post-traffic-filter", () => {
  setupTestEnvironment();

  let createdKey: string | undefined;

  afterEach(async () => {
    if (createdKey) {
      const context = createMockRequestHandlerExtra();
      await deleteTrafficFilterTool.handler({ key: createdKey }, context);
      createdKey = undefined;
    }
  });

  it("should create a traffic filter and return its key", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postTrafficFilterTool.handler(
      {
        name: TEST_TRAFFIC_FILTER_NAME,
        description: "test",
        type: "UserAgent",
        mode: "Block",
        condition: "Contains",
        value: "_TestAgent",
        values: ["_TestAgent"],
        isActive: true,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as { key?: string };
    expect(structuredContent.key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    createdKey = structuredContent.key;
  }, 30000);
});
