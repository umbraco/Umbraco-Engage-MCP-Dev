import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postGoalTool from "../post/post-goal.js";
import tool from "../get/get-goal-details.js";

const TEST_GOAL_NAME = "_Test Goal Details";
const TEST_GOAL_TYPE_ID = "00000000-0000-0000-0000-000000000000";
const TEST_GOAL_VALUE = 1;
const TEST_NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-goal-details", () => {
  setupTestEnvironment();

  // There is no delete-goal endpoint in this collection, so this permanently
  // adds a row (same accepted limitation as post-goal.test.ts). The numeric
  // `id` field returned is an auto-increment that grows across runs, so it
  // can't be part of a stable snapshot — assert the deterministic fields
  // (the ones we set on creation) instead.
  it(
    "returns details for an existing goal",
    async () => {
      const context = createMockRequestHandlerExtra();

      const created = await postGoalTool.handler(
        {
          name: TEST_GOAL_NAME,
          value: TEST_GOAL_VALUE,
          goalTypeId: TEST_GOAL_TYPE_ID,
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
      const uniqueId = (created.structuredContent as { unique: string }).unique;

      const result = await tool.handler({ id: uniqueId }, context);

      expect(result.isError).toBeFalsy();
      const content = result.structuredContent as {
        unique: string;
        name: string;
        value: number;
        goalTypeId: string;
        isMain: boolean;
        isInverted: boolean;
        isActive: boolean;
        isInvalid: boolean;
      };
      expect(content.unique).toBe(uniqueId);
      expect(content.name).toBe(TEST_GOAL_NAME);
      expect(content.value).toBe(TEST_GOAL_VALUE);
      expect(content.goalTypeId).toBe(TEST_GOAL_TYPE_ID);
      expect(content.isMain).toBe(false);
      expect(content.isInverted).toBe(false);
      expect(content.isActive).toBe(true);
      expect(content.isInvalid).toBe(false);
    },
    15000,
  );

  // Empirically confirmed: a syntactically-valid but non-existent goal
  // unique id returns a 404, not a synthetic default-200 response.
  it("returns a 404 error for a non-existent goal id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler({ id: TEST_NON_EXISTENT_ID }, context);

    expect(result.isError).toBe(true);
    expect((result.structuredContent as { status: number }).status).toBe(404);
  });
});
