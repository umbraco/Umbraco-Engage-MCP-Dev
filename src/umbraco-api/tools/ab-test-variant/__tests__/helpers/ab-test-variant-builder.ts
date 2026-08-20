import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { AbTestFixture } from "./ab-test-fixture.js";
import postAbTestVariantCreateTool from "../../post/post-ab-test-variant-create.js";
import deleteAbTestVariantTool from "../../delete/delete-ab-test-variant.js";

/**
 * Builds a real, genuinely persisted A/B test variant.
 *
 * Uses the local `AbTestFixture` (not the sibling `ab-test` collection's own
 * `AbTestBuilder` - this repo's convention is one-builder-per-collection
 * with no cross-collection imports) to obtain a real parent `abTestId`, then
 * calls `post-ab-test-variant-create` - the query-param-only "genuinely add
 * a new variant" endpoint, simpler than `post-ab-test-variant`'s full-body
 * upsert - to create a real new variant row under that test.
 */
export class AbTestVariantBuilder {
  private abTest = new AbTestFixture();

  private createdId?: number;
  private createdUnique?: string;
  private createdAbTestId?: number;

  async create(): Promise<this> {
    const context = createMockRequestHandlerExtra();

    await this.abTest.create();
    const testId = this.abTest.getTestId();

    const created = await postAbTestVariantCreateTool.handler({ testId }, context);
    if (created.isError) {
      throw new Error(
        `Failed to create a real A/B test variant: ${JSON.stringify(created.content)}`,
      );
    }

    const structuredContent = created.structuredContent as
      | { id: number; unique: string; abTestId: number }
      | undefined;
    if (structuredContent?.id === undefined) {
      throw new Error(
        `post-ab-test-variant-create did not return an id: ${JSON.stringify(created)}`,
      );
    }

    this.createdId = structuredContent.id;
    this.createdUnique = structuredContent.unique;
    this.createdAbTestId = structuredContent.abTestId;

    return this;
  }

  /** The real, persisted variant's numeric id. */
  getVariantId(): number {
    if (this.createdId === undefined) {
      throw new Error("A/B test variant not created yet. Call create() first.");
    }
    return this.createdId;
  }

  /** The real, persisted variant's uuid. */
  getVariantUnique(): string {
    if (!this.createdUnique) {
      throw new Error("A/B test variant not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  /** The real parent A/B test's numeric id the variant is attached to. */
  getAbTestId(): number {
    if (this.createdAbTestId === undefined) {
      throw new Error("A/B test variant not created yet. Call create() first.");
    }
    return this.createdAbTestId;
  }

  async delete(): Promise<void> {
    if (this.createdId !== undefined) {
      const context = createMockRequestHandlerExtra();
      try {
        await deleteAbTestVariantTool.handler({ variantId: this.createdId }, context);
      } catch {
        // ignore cleanup errors
      }
      this.createdId = undefined;
      this.createdUnique = undefined;
      this.createdAbTestId = undefined;
    }

    await this.abTest.delete();
  }
}
