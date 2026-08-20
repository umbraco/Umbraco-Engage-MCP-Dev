import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-goal.js";

const TEST_GOAL_NAME = "_Test Goal";
const TEST_GOAL_TYPE_ID = "00000000-0000-0000-0000-000000000000";

describe("post-goal", () => {
  setupTestEnvironment();

  it(
    "creates a goal and returns its unique id",
    async () => {
      const context = createMockRequestHandlerExtra();
      const uniqueId = crypto.randomUUID();

      const result = await tool.handler(
        {
          id: null,
          unique: uniqueId,
          name: TEST_GOAL_NAME,
          value: 1,
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

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBe(uniqueId);
    },
    15000,
  );
});
