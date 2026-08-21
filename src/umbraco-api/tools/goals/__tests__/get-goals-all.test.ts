import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import { deleteTestGoals } from "../../goal/__tests__/helpers/sql-cleanup.js";
import postGoalTool from "../../goal/post/post-goal.js";
import getGoalsAllTool from "../get/get-goals-all.js";

const TEST_GOAL_NAME = "_Test Goal Get All";

// Goals have no delete endpoint (see goal/__tests__/helpers/sql-cleanup.ts),
// so this list is shared and grows across every collection's test run in
// the same suite (ab-test/ab-test-variant's fixture builders create real
// goals too) - a full-content snapshot here would be inherently unstable
// depending on run order, not a real regression. Assert shape plus that a
// freshly-created goal genuinely appears, instead.
describe("get-goals-all", () => {
  setupTestEnvironment();

  afterAll(() => {
    deleteTestGoals();
  });

  it("returns an array of goals with the expected shape", async () => {
    const result = await getGoalsAllTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: unknown[] }).items;
    expect(Array.isArray(items)).toBe(true);
  });

  it("includes a real, freshly-created goal in the unpaginated list", async () => {
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
    const createdKey = (created.structuredContent as { unique: string }).unique;

    const result = await getGoalsAllTool.handler({}, context);
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { key: string }[] }).items;
    expect(items.some((item) => item.key === createdKey)).toBe(true);
  });
});
