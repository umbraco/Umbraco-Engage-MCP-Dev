import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-goal.js";

describe("post-goal", () => {
  setupTestEnvironment();

  // There is no delete-goal endpoint anywhere in the Engage Management API
  // (confirmed — no deleteGoal client method exists), so every run of this
  // test permanently creates a new goal row with no way to clean it up via
  // the API. Accepted as-is: this demo instance's database gets recycled
  // periodically, so the accumulation isn't a lasting problem. The response
  // is a bare uuid that echoes back the client-supplied `unique`, so a
  // direct equality assertion is used instead of a snapshot (see
  // post-traffic-filter.test.ts for the same reasoning).
  it("creates a new goal", async () => {
    const context = createMockRequestHandlerExtra();
    const suppliedUnique = crypto.randomUUID();

    const result: any = await postTool.handler(
      {
        id: null,
        unique: suppliedUnique,
        name: "_Test Goal",
        value: 1,
        goalTypeId: "00000000-0000-0000-0000-000000000000",
        goalTypeConfig: "{}",
        isMain: false,
        isInverted: false,
        isActive: true,
        isInvalid: false,
        isImplicitScoringEnabled: false,
        implicitPersonaScoring: [],
      } as any,
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toBe(suppliedUnique);
  });
});
