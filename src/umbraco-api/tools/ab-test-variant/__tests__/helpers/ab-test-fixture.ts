import { randomUUID } from "node:crypto";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { ContentPageFixture } from "../../../../../testing/content-page-fixture.js";
import postAbTestTool from "../../../ab-test/post/post-ab-test.js";
import deleteAbTestTool from "../../../ab-test/delete/delete-ab-test.js";
import postGoalTool from "../../../goal/post/post-goal.js";
import getGoalDetailsTool from "../../../goal/get/get-goal-details.js";
import getGoalAllTypesTool from "../../../goal/get/get-goal-all-types.js";

export const TEST_AB_TEST_VARIANT_FIXTURE_NAME = "_Test AB Test Variant Fixture Parent";
export const TEST_AB_TEST_VARIANT_FIXTURE_GOAL_NAME = "_Test AB Test Variant Fixture Goal";

/**
 * Trimmed, LOCAL fixture that produces a real, genuinely persisted A/B test
 * for the `ab-test-variant` collection to attach a new variant to.
 *
 * This deliberately DUPLICATES (rather than imports) the dependency chain
 * from the sibling `ab-test` collection's own `AbTestBuilder`
 * (`ab-test/__tests__/helpers/ab-test-builder.ts`) - this repo's convention
 * is one-builder-per-collection with no cross-collection imports. See that
 * file for the original, more fully-featured implementation this was copied
 * from.
 *
 * Only exposes what `ab-test-variant`'s own fixtures/builders need: a real
 * numeric `abTestId` to pass to `post-ab-test-variant-create`. It does not
 * expose/vary every knob (goal name, variant naming, page key, etc.) that
 * `ab-test`'s own builder does - callers here don't need them.
 *
 * Two real bugs baked into this implementation from the start (found while
 * building the sibling `ab-test` fixture - see that file's comments for the
 * full empirical detail):
 *   1. `post-goal`'s `goalTypeId` must be a REAL goal type id fetched from
 *      `get-goal-all-types` (the one with `configurationEditorAlias ===
 *      "CustomGoal"`) - an all-zero placeholder guid persists the goal fine
 *      but fails `post-ab-test`'s validation ("The selected goal should be
 *      active and valid").
 *   2. `post-ab-test`'s `goalId` and `goal` inputs must describe the SAME
 *      real goal - the server validates the embedded, client-echoed `goal`
 *      object, not a live lookup by `goalId` alone.
 */
export class AbTestFixture {
  private name: string = TEST_AB_TEST_VARIANT_FIXTURE_NAME;
  private goalName: string = TEST_AB_TEST_VARIANT_FIXTURE_GOAL_NAME;
  private contentPage = new ContentPageFixture();

  private createdId?: number;
  private createdUnique?: string;

  async create(): Promise<this> {
    const context = createMockRequestHandlerExtra();

    // 1. Real published content page - post-ab-test's `pageUnique` needs a
    // real page key (create-document's returned id IS the content node's key).
    await this.contentPage.create();
    const pageKey = this.contentPage.getKey();

    // 2. Real goal (no delete-goal endpoint exists in this collection -
    // left as an accepted orphan, see delete() below).
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
        `Failed to create goal for A/B test variant fixture: ${JSON.stringify(goalResult.content)}`,
      );
    }

    // 3. Resolve the goal's real numeric id - post-ab-test's `goalId` needs
    // this numeric id, not the goal's uuid `unique`.
    const goalDetails = await getGoalDetailsTool.handler({ id: goalUnique }, context);
    if (goalDetails.isError) {
      throw new Error(
        `Failed to resolve goal details for A/B test variant fixture: ${JSON.stringify(
          goalDetails.content,
        )}`,
      );
    }
    const goalNumericId = (goalDetails.structuredContent as { id: number }).id;

    // 4. Persist - post-ab-test builds the full server payload internally.
    const created = await postAbTestTool.handler(
      {
        name: this.name,
        testType: "SinglePage",
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
        `Failed to create a valid, persisted A/B test for the variant fixture: ${JSON.stringify(
          structuredContent?.validationResults ?? created.content,
        )}`,
      );
    }

    this.createdId = structuredContent.test.test.id;
    this.createdUnique = structuredContent.test.test.unique;

    return this;
  }

  /** The real, persisted A/B test's numeric id - what post-ab-test-variant-create needs. */
  getTestId(): number {
    if (this.createdId === undefined) {
      throw new Error("A/B test fixture not created yet. Call create() first.");
    }
    return this.createdId;
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
    // collection (same accepted, permanent-row limitation as the sibling
    // `ab-test` fixture, and as goal/document-type-permissions' own tests)
    // - it's left as an orphan.

    await this.contentPage.delete();
  }
}
