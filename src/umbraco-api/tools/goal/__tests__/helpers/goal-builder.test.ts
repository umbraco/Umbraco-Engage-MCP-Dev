import {
  setupTestEnvironment,
  GoalBuilder,
  GoalTestHelper,
  TEST_GOAL_TYPE_ID,
} from "../setup.js";

// Requires the `sql` docker container to be running (see sql-cleanup.ts) -
// cleanup() bypasses the Management API's missing delete-goal endpoint via
// a direct SQL delete.
const TEST_NAME = "_Test Goal Builder";

describe("GoalBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await GoalTestHelper.cleanup();
  });

  it("creates a goal via the real post-goal tool and exposes its id", async () => {
    const builder = await new GoalBuilder()
      .withName(TEST_NAME)
      .withValue(42)
      .create();

    expect(builder.getId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const found = await GoalTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.unique).toBe(builder.getId());
  });

  it("throws when getId() is called before create()", () => {
    const fresh = new GoalBuilder();
    expect(() => fresh.getId()).toThrow();
  });

  it("build() returns a snapshot of the current model without creating it", () => {
    const fresh = new GoalBuilder().withName(TEST_NAME).withGoalTypeId(TEST_GOAL_TYPE_ID);
    const model = fresh.build();
    expect(model.name).toBe(TEST_NAME);
    expect(model.goalTypeId).toBe(TEST_GOAL_TYPE_ID);
  });

  it("delete() sweeps _Test/_Probe-prefixed goals via the SQL cleanup, not just its own row", async () => {
    const builder = await new GoalBuilder().withName(TEST_NAME).create();

    await builder.delete();

    const found = await GoalTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();
  });
});
