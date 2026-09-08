import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { ContentPageFixture } from "../../../../../testing/content-page-fixture.js";
import postAbTestTool from "../../post/post-ab-test.js";
import deleteAbTestTool from "../../delete/delete-ab-test.js";
import postGoalTool from "../../../goal/post/post-goal.js";
import getGoalDetailsTool from "../../../goal/get/get-goal-details.js";
import getGoalAllTypesTool from "../../../goal/get/get-goal-all-types.js";

export const TEST_AB_TEST_NAME = "_Test AB Test";
export const TEST_AB_TEST_GOAL_NAME = "_Test AB Test Goal";

/**
 * Builds a real, genuinely persisted A/B test via the chain of dependencies
 * the Engage API requires:
 *   1. A real published Umbraco content page (via ContentPageFixture, over
 *      the chained CMS MCP server) - post-ab-test's `pageUnique` needs a
 *      real page key, not a placeholder guid.
 *   2. A real goal (post-goal) - post-ab-test's `goalId` needs a real,
 *      resolvable numeric id, not the goal's uuid `unique`.
 *   3. post-ab-test itself, which now builds the full server payload
 *      internally from this minimal input.
 *
 * Empirically confirmed: goalTypeId must be a REAL goal type's id, fetched
 * from get-goal-all-types - an all-zero placeholder id persists the goal
 * fine but fails post-ab-test's validation with "The selected goal should
 * be active and valid".
 */
export class AbTestBuilder {
  private name: string = TEST_AB_TEST_NAME;
  private goalName: string = TEST_AB_TEST_GOAL_NAME;
  private contentPage = new ContentPageFixture();
  private projectId?: number;
  private testType: "SinglePage" | "MultiPage" | "ContentType" | "SplitUrl" = "SinglePage";
  private secondPage?: ContentPageFixture;

  private createdId?: number;
  private createdUnique?: string;

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withGoalName(goalName: string): this {
    this.goalName = goalName;
    return this;
  }

  withProjectId(projectId: number): this {
    this.projectId = projectId;
    return this;
  }

  /** Builds a SplitUrl test instead: creates a second real published page for the second variant to redirect to. */
  withSplitUrl(): this {
    this.testType = "SplitUrl";
    this.secondPage = new ContentPageFixture();
    return this;
  }

  async create(): Promise<this> {
    const context = createMockRequestHandlerExtra();

    // 1. Real published content page - post-ab-test's `pageUnique` needs a
    // real page key (create-document's returned id IS the content node's key).
    await this.contentPage.create();
    const pageKey = this.contentPage.getKey();
    if (this.secondPage) {
      await this.secondPage.create();
    }

    // 2. Real goal (no delete-goal endpoint exists in this collection - see
    // delete() below for the accepted-orphan tradeoff, same as goal's own tests).
    //
    // goalTypeId must be a REAL goal type's id, fetched from
    // get-goal-all-types - "00000000-0000-0000-0000-000000000000" is NOT a
    // valid placeholder here (unlike e.g. redirectNodeKey elsewhere): the
    // server's own get-goal-all-types snapshot in this repo shows ids
    // normalized to all-zeros for snapshot stability, which is easy to
    // mistake for the real value, but the real ids are distinct non-zero
    // guids. Using the fake all-zero id creates a goal that persists fine
    // but fails post-ab-test's validation with "The selected goal should be
    // active and valid" - confirmed empirically.
    const goalTypes = await getGoalAllTypesTool.handler({}, context);
    if (goalTypes.isError) {
      throw new Error(`Failed to fetch goal types: ${JSON.stringify(goalTypes.content)}`);
    }
    const customGoalType = (
      goalTypes.structuredContent as { items: { id: string; configurationEditorAlias: string }[] }
    ).items.find((t) => t.configurationEditorAlias === "CustomGoal");
    if (!customGoalType) {
      throw new Error(
        `No "CustomGoal" goal type found: ${JSON.stringify(goalTypes.structuredContent)}`,
      );
    }

    const goalResult = await postGoalTool.handler(
      {
        name: this.goalName,
        value: 1,
        goalTypeId: customGoalType.id,
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
    if (goalResult.isError) {
      throw new Error(
        `Failed to create goal for A/B test: ${JSON.stringify(goalResult.content)}`,
      );
    }
    const goalUnique = (goalResult.structuredContent as { unique: string }).unique;

    // 3. Resolve the goal's real numeric id - post-ab-test's `goalId` needs
    // this numeric id, not the goal's uuid `unique`.
    const goalDetails = await getGoalDetailsTool.handler({ id: goalUnique }, context);
    if (goalDetails.isError) {
      throw new Error(
        `Failed to resolve goal details for A/B test: ${JSON.stringify(goalDetails.content)}`,
      );
    }
    const goalNumericId = (goalDetails.structuredContent as { id: number }).id;

    // 4. Persist - post-ab-test builds the full server payload internally.
    const created = await postAbTestTool.handler(
      {
        name: this.name,
        testType: this.testType,
        goalId: goalNumericId,
        goal: {
          key: goalUnique,
          name: this.goalName,
          value: 1,
          goalTypeId: customGoalType.id,
          goalTypeConfig: "{}",
          isMain: false,
          isInverted: false,
          isActive: true,
          isInvalid: false,
        },
        pageUnique: pageKey,
        secondVariantPageUnique: this.secondPage?.getKey(),
        projectId: this.projectId,
        secondVariantName: "Variant B",
        participationPercentage: 1,
        minimumDetectableEffect: 0.1,
        estimatedDailyVisitors: 0,
        baselineConversionRate: 0.05,
      },
      context,
    );
    const structuredContent = created.structuredContent as
      | {
          test: { test: { id: number; unique: string } };
          validationResults: { isValid: boolean; warnings: string[]; errors: string[] };
        }
      | undefined;

    if (created.isError || !structuredContent?.validationResults?.isValid) {
      throw new Error(
        `Failed to create a valid, persisted A/B test: ${JSON.stringify(
          structuredContent?.validationResults ?? created.content,
        )}`,
      );
    }

    this.createdId = structuredContent.test.test.id;
    this.createdUnique = structuredContent.test.test.unique;

    return this;
  }

  getId(): number {
    if (this.createdId === undefined) {
      throw new Error("A/B test not created yet. Call create() first.");
    }
    return this.createdId;
  }

  getUnique(): string {
    if (!this.createdUnique) {
      throw new Error("A/B test not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  /** The real, published content page's key/unique guid the test targets. */
  getPageKey(): string {
    return this.contentPage.getKey();
  }

  /** The second variant's real page (SplitUrl tests only - see withSplitUrl()). */
  getSecondVariantPageKey(): string {
    if (!this.secondPage) {
      throw new Error("Not a SplitUrl test - call withSplitUrl() first.");
    }
    return this.secondPage.getKey();
  }

  async delete(): Promise<void> {
    if (this.createdUnique) {
      const context = createMockRequestHandlerExtra();
      try {
        await deleteAbTestTool.handler({ unique: this.createdUnique }, context);
      } catch {
        // ignore cleanup errors
      }
      this.createdId = undefined;
      this.createdUnique = undefined;
    }

    // The goal created in create() has no delete-goal endpoint in this
    // collection (same accepted, permanent-row limitation as
    // goal/__tests__/get-goal-details.test.ts) - it's left as an orphan.

    await this.contentPage.delete();
    if (this.secondPage) {
      await this.secondPage.delete();
    }
  }
}
