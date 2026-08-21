import { setupTestEnvironment, createMockRequestHandlerExtra } from "../setup.js";
import { deleteTestGoals } from "./sql-cleanup.js";
import postGoalTool from "../../post/post-goal.js";
import getGoalDetailsTool from "../../get/get-goal-details.js";

const TEST_GOAL_NAME = "_Test SQL Cleanup Helper";

// Talks to SQL Server directly via `docker exec` (no delete-goal API
// endpoint exists) - requires the sql container/database from
// SQL_CONTAINER_NAME/SQL_DATABASE_NAME (or their local-dev defaults) to be
// reachable, same requirement as post-goal-all.test.ts.
describe("deleteTestGoals", () => {
  setupTestEnvironment();

  it("deletes a goal whose name matches the _Test prefix", async () => {
    const context = createMockRequestHandlerExtra();
    const created = await postGoalTool.handler(
      {
        name: TEST_GOAL_NAME,
        value: 1,
        goalTypeId: "00000000-0000-0000-0000-000000000000",
        goalTypeConfig: "{}",
        isMain: false,
        isInverted: false,
        isActive: true,
        isInvalid: false,
        isImplicitScoringEnabled: false,
        implicitPersonaScoring: [],
        implicitCustomerJourneyStepScoring: [],
      },
      context,
    );
    expect(created.isError).toBeFalsy();
    const unique = (created.structuredContent as { unique: string }).unique;

    // Sanity check it's really there before cleanup runs.
    const beforeCleanup = await getGoalDetailsTool.handler({ id: unique }, context);
    expect(beforeCleanup.isError).toBeFalsy();

    deleteTestGoals();

    const afterCleanup = await getGoalDetailsTool.handler({ id: unique }, context);
    expect(afterCleanup.isError).toBe(true);
  }, 30000);
});
