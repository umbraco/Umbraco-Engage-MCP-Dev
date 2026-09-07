import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import { deleteTestGoals } from "../../goal/__tests__/helpers/sql-cleanup.js";
import postGoalTool from "../../goal/post/post-goal.js";
import getGoalsMainTool from "../get/get-goals-main.js";

const TEST_GOAL_NAME = "_Test Goal Get Main";

function goalInput(name: string, isMain: boolean) {
  return {
    name,
    value: 1,
    goalTypeId: "00000000-0000-0000-0000-000000000000",
    goalTypeConfig: "{}",
    isMain,
    isInverted: false,
    isActive: true,
    isInvalid: false,
    isImplicitScoringEnabled: false,
    implicitPersonaScoring: [],
    implicitCustomerJourneyStepScoring: [],
  };
}

// Goals have no delete endpoint (see goal/__tests__/helpers/sql-cleanup.ts),
// so this list is shared and grows across every collection's test run in
// the same suite - a full-content snapshot here would be inherently
// unstable depending on run order. Assert shape plus that a freshly-created
// goal genuinely appears, instead (same reasoning as get-goals-all's test).
describe("get-goals-main", () => {
  setupTestEnvironment();

  afterAll(() => {
    deleteTestGoals();
  });

  it("returns an array of goals with the expected shape", async () => {
    const result = await getGoalsMainTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: unknown[] }).items;
    expect(Array.isArray(items)).toBe(true);
  });

  // The tool's own description flagged that the distinction from
  // get-goals-all was unconfirmed - probed here with an isMain:true and an
  // isMain:false goal side by side. Confirmed empirically: this endpoint
  // genuinely filters server-side to isMain:true goals only - the
  // isMain:false goal created alongside it is NOT returned here at all.
  it("includes a real, freshly-created main goal but excludes a non-main one", async () => {
    const context = createMockRequestHandlerExtra();

    const mainGoal = await postGoalTool.handler(goalInput(`${TEST_GOAL_NAME} Main`, true), context);
    expect(mainGoal.isError).toBeFalsy();
    const mainKey = (mainGoal.structuredContent as { unique: string }).unique;

    const nonMainGoal = await postGoalTool.handler(
      goalInput(`${TEST_GOAL_NAME} Non-Main`, false),
      context,
    );
    expect(nonMainGoal.isError).toBeFalsy();
    const nonMainKey = (nonMainGoal.structuredContent as { unique: string }).unique;

    const result = await getGoalsMainTool.handler({}, context);
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { key: string; isMain: boolean }[] }).items;

    const foundMain = items.find((item) => item.key === mainKey);
    expect(foundMain).toBeDefined();
    expect(foundMain!.isMain).toBe(true);

    const foundNonMain = items.find((item) => item.key === nonMainKey);
    expect(foundNonMain).toBeUndefined();
  });
});
