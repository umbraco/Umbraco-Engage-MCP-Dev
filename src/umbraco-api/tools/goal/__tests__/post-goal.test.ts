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

      const result = await tool.handler(
        {
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
      const structuredContent = result.structuredContent as { unique?: string };
      expect(structuredContent.unique).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    },
    15000,
  );
});
