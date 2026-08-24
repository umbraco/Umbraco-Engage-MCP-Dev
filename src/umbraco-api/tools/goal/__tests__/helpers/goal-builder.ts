import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import postGoalTool from "../../post/post-goal.js";
import { deleteTestGoals } from "./sql-cleanup.js";

// Falls under the `_Test`/`_Probe` name prefixes that deleteTestGoals()'s
// SQL sweep targets - see sql-cleanup.ts.
export const TEST_GOAL_NAME = "_Test Goal";
// The Engage Management API accepts an all-zero placeholder goalTypeId for
// persistence purposes (unlike post-ab-test's goalId, which validates
// against a real goal type - see ab-test-builder.ts).
export const TEST_GOAL_TYPE_ID = "00000000-0000-0000-0000-000000000000";

type GoalModel = Parameters<typeof postGoalTool.handler>[0];

/**
 * Builds a real, persisted goal via the actual `post-goal` tool handler
 * (not a direct API client call) - post-goal has bespoke logic (server-side
 * `randomUUID()` generation for the top-level `unique` and every scoring
 * row) that a builder calling the API client directly would have to
 * duplicate.
 *
 * Note the created goal's `unique` id can't be pre-set on this builder the
 * way e.g. `AbTestProjectBuilder.withUnique()` can - `post-goal` always
 * generates it server-side inside the handler, so `create()` simply
 * captures whatever comes back.
 */
export class GoalBuilder {
  private model: GoalModel = {
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
  };

  private createdId?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withValue(value: number): this {
    this.model.value = value;
    return this;
  }

  withGoalTypeId(goalTypeId: string): this {
    this.model.goalTypeId = goalTypeId;
    return this;
  }

  withGoalTypeConfig(goalTypeConfig: string): this {
    this.model.goalTypeConfig = goalTypeConfig;
    return this;
  }

  withMain(isMain: boolean): this {
    this.model.isMain = isMain;
    return this;
  }

  withInverted(isInverted: boolean): this {
    this.model.isInverted = isInverted;
    return this;
  }

  withActive(isActive: boolean): this {
    this.model.isActive = isActive;
    return this;
  }

  withInvalid(isInvalid: boolean): this {
    this.model.isInvalid = isInvalid;
    return this;
  }

  withImplicitScoringEnabled(isImplicitScoringEnabled: boolean): this {
    this.model.isImplicitScoringEnabled = isImplicitScoringEnabled;
    return this;
  }

  withImplicitPersonaScoring(
    implicitPersonaScoring: GoalModel["implicitPersonaScoring"],
  ): this {
    this.model.implicitPersonaScoring = implicitPersonaScoring;
    return this;
  }

  withImplicitCustomerJourneyStepScoring(
    implicitCustomerJourneyStepScoring: GoalModel["implicitCustomerJourneyStepScoring"],
  ): this {
    this.model.implicitCustomerJourneyStepScoring = implicitCustomerJourneyStepScoring;
    return this;
  }

  build(): GoalModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const context = createMockRequestHandlerExtra();
    const result = await postGoalTool.handler(this.model, context);
    if (result.isError) {
      throw new Error(`Failed to create goal: ${JSON.stringify(result.content)}`);
    }
    this.createdId = (result.structuredContent as { unique: string }).unique;
    return this;
  }

  /**
   * There is no delete-goal endpoint anywhere in the Engage Management API,
   * so this can't target just this builder's own row - it delegates to
   * `deleteTestGoals()` (`sql-cleanup.ts`), which sweeps ALL rows matching
   * the `_Test`/`_Probe` name prefixes directly via SQL. Calling `delete()`
   * on one builder instance may therefore also clean up other
   * `_Test`/`_Probe`-prefixed goals created elsewhere in the same test run -
   * this is a best-effort sweep, not a targeted per-instance delete.
   */
  async delete(): Promise<void> {
    deleteTestGoals();
    this.createdId = undefined;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Goal not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
