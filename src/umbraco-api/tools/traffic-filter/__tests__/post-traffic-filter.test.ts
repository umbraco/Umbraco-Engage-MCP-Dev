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
    const key = crypto.randomUUID();

    const result = await postTrafficFilterTool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        key,
        createdByUmbracoUserName: null,
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

    createdKey = key;

    expect(result.isError).toBeFalsy();

    // The create response is a BARE uuid string (the created key), echoing back
    // whatever key was supplied — assert equality directly rather than
    // snapshotting, since a snapshot would capture this per-run random value.
    expect(result.structuredContent).toBe(key);
  }, 30000);
});
