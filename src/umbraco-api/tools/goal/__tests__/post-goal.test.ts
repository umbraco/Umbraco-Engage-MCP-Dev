import { setupTestEnvironment, GoalBuilder, GoalTestHelper } from "./setup.js";

const TEST_GOAL_NAME = "_Test Goal";

describe("post-goal", () => {
  setupTestEnvironment();

  // There is no delete-goal endpoint in this collection - GoalBuilder.delete()
  // sweeps _Test/_Probe-prefixed rows via direct SQL (see
  // helpers/sql-cleanup.ts), so this no longer leaks a permanent row.
  afterEach(async () => {
    await GoalTestHelper.cleanup();
  });

  it(
    "creates a goal and returns its unique id",
    async () => {
      const builder = await new GoalBuilder().withName(TEST_GOAL_NAME).create();

      expect(builder.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    },
    15000,
  );
});
