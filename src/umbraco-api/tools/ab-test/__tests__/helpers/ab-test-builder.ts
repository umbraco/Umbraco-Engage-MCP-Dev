import { randomUUID } from "node:crypto";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import type { z } from "zod";
import { postAbTestBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { ContentPageFixture } from "../../../../../testing/content-page-fixture.js";
import getAbTestEmptyTool from "../../get/get-ab-test-empty.js";
import postAbTestTool from "../../post/post-ab-test.js";
import deleteAbTestTool from "../../delete/delete-ab-test.js";
import postGoalTool from "../../../goal/post/post-goal.js";
import getGoalDetailsTool from "../../../goal/get/get-goal-details.js";
import getGoalAllTypesTool from "../../../goal/get/get-goal-all-types.js";

export const TEST_AB_TEST_NAME = "_Test AB Test";
export const TEST_AB_TEST_GOAL_NAME = "_Test AB Test Goal";

type AbTestBody = z.infer<typeof postAbTestBody>;
type AbTestDraft = AbTestBody["test"];

/**
 * Builds a real, genuinely persisted A/B test via the chain of dependencies
 * the Engage API requires:
 *   1. A real published Umbraco content page (via ContentPageFixture, over
 *      the chained CMS MCP server) - umbracoPageVariants needs a real page
 *      key, not a placeholder guid.
 *   2. A real goal (post-goal) - test.goalId needs a real, resolvable
 *      numeric id, not the goal's uuid `unique`.
 *   3. The server's own blank draft template (get-ab-test-empty), mutated
 *      minimally (goalId, name, umbracoPageVariants, and naming the second
 *      variant stub) and posted back (post-ab-test).
 *
 * Empirically confirmed: starting from get-ab-test-empty's draft, the
 * fields that must change to flip validationResults.isValid from false to
 * true are goalId AND the embedded goal object (populated with a REAL,
 * fetched goal type id - not an all-zero placeholder), name,
 * umbracoPageVariants, and the second variant's name.
 */
export class AbTestBuilder {
  private name: string = TEST_AB_TEST_NAME;
  private goalName: string = TEST_AB_TEST_GOAL_NAME;
  private contentPage = new ContentPageFixture();

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

  async create(): Promise<this> {
    const context = createMockRequestHandlerExtra();

    // 1. Real published content page - umbracoPageVariants needs a real
    // page key (create-document's returned id IS the content node's key).
    await this.contentPage.create();
    const pageKey = this.contentPage.getKey();

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

    const goalUnique = randomUUID();
    const goalResult = await postGoalTool.handler(
      {
        id: null,
        unique: goalUnique,
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

    // 3. Resolve the goal's real numeric id - post-ab-test's test.goalId
    // needs this numeric id, not the goal's uuid `unique`.
    const goalDetails = await getGoalDetailsTool.handler({ id: goalUnique }, context);
    if (goalDetails.isError) {
      throw new Error(
        `Failed to resolve goal details for A/B test: ${JSON.stringify(goalDetails.content)}`,
      );
    }
    const goalNumericId = (goalDetails.structuredContent as { id: number }).id;
    const goalCreatedByKey = randomUUID();
    const goalCreatedAt = new Date().toISOString();

    // 4. The server's own blank draft template. post-ab-test's body shape is
    // identical to get-ab-test-empty's response shape (test/indication/
    // variants/isInvertedGoal) - post the whole thing back, not just `test`.
    const empty = await getAbTestEmptyTool.handler({ testType: "SinglePage" }, context);
    if (empty.isError) {
      throw new Error(
        `Failed to fetch blank A/B test draft: ${JSON.stringify(empty.content)}`,
      );
    }
    const body = empty.structuredContent as Required<AbTestBody>;
    const draft = body.test;

    // 5. Mutate the draft. NOTE: goalId alone is not enough - the server
    // validates the EMBEDDED test.goal object (client-echoed, not
    // server-looked-up by goalId), so it must be populated too, or
    // validation fails with "The selected goal should be active and valid"
    // even though goalId correctly points to a real, active goal - confirmed
    // empirically. get-goal-details doesn't return created/createdBy, so
    // those are supplied directly from what we know we just posted.
    draft.goalId = goalNumericId;
    draft.goal = {
      id: goalNumericId,
      key: goalUnique,
      name: this.goalName,
      value: 1,
      goalTypeId: customGoalType.id,
      goalTypeConfig: "{}",
      isMain: false,
      isInverted: false,
      isActive: true,
      isInvalid: false,
      created: goalCreatedAt,
      createdBy: goalCreatedByKey,
      updated: null,
      updatedBy: null,
    };
    draft.name = this.name;
    draft.umbracoPageVariants = [
      {
        id: 0,
        unique: pageKey,
        nodeName: null,
        culture: null,
        abTestId: null,
        variesBySegment: false,
      },
    ];
    draft.variants = draft.variants.map((variant) =>
      variant.isBenchmark ? variant : { ...variant, name: "Variant B" },
    );

    // 6. Persist.
    const created = await postAbTestTool.handler(body, context);
    const structuredContent = created.structuredContent as
      | {
          test: { test: AbTestDraft };
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
  }
}
