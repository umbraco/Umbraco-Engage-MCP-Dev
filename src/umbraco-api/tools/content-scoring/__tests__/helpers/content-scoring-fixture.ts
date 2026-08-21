import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { ContentPageFixture } from "../../../../../testing/content-page-fixture.js";
import { PersonaSegmentBuilder } from "./persona-segment-builder.js";
import postContentScoringSaveTool from "../../post/post-content-scoring-save.js";
import getContentScoringAllTool from "../../get/get-content-scoring-all.js";
import deleteContentScoringPersonaTool from "../../delete/delete-content-scoring-persona.js";

/**
 * Real, working fixture for the `content-scoring` collection. A genuine
 * content-scoring row needs BOTH a real, published document (`documentUnique`)
 * AND a real numeric persona-segment id (`entityId`) — this fixture builds
 * both dependencies and then saves a real "Persona" type content-scoring row
 * referencing them.
 *
 * Dependency chain:
 *   1. `ContentPageFixture` — real published Umbraco content page via the
 *      chained CMS MCP server, whose key is the row's `documentUnique`.
 *   2. `PersonaSegmentBuilder` — real persona with one real nested segment,
 *      whose `personas[0].id` is the row's `entityId`.
 *   3. `post-content-scoring-save` — void endpoint, no id returned.
 *   4. `get-content-scoring-all({ unique: documentUnique })` — used
 *      immediately after saving to find and capture the row's own real `id`
 *      (matched by `entityId`), since post-content-scoring-save doesn't
 *      return one and delete-content-scoring-persona needs it.
 */
export class ContentScoringFixture {
  private contentPage = new ContentPageFixture();
  private personaSegment = new PersonaSegmentBuilder();

  private documentUnique?: string;
  private entityId?: number;
  private rowId?: number;

  async create(): Promise<this> {
    // Wrapped in try/catch: if any step fails partway through, whatever was
    // already created (content page, persona) must still be cleaned up here
    // rather than left as an orphan — the caller's `fixture` variable is
    // never assigned when create() throws, so a test's own afterEach/
    // fixture.delete() never runs for a failed create(). Confirmed the hard
    // way: an earlier bug (fixed below) caused several failed create() runs
    // that leaked real content pages and personas.
    //
    // KNOWN RESIDUAL RISK: if a real network call inside this chain hangs
    // long enough to exceed Jest's own per-test timeout, Jest reports the
    // test as failed and moves on, but does NOT actually cancel this
    // function's execution - the awaited call can still resolve later in
    // the background. If the whole Jest process exits before that happens,
    // this catch block (and its cleanup) may never run, leaving a real
    // orphan. Observed once under heavy session-wide load (many chained CMS
    // spawns in a short window); not reproducible in isolation. This is a
    // structural limitation of testing real, slow, external I/O against a
    // hard test timeout, not a logic bug in this fixture - flagging so a
    // future stray "_Test Fixture Page"/persona is understood, not a
    // mystery.
    try {
      const context = createMockRequestHandlerExtra();

      // 1. Real published content page.
      await this.contentPage.create();
      this.documentUnique = this.contentPage.getKey();

      // 2. Real persona segment (numeric sub-entity id, resolved via a
      // follow-up get-persona-details lookup inside PersonaSegmentBuilder -
      // see its create() for why the create response's own id can't be used).
      await this.personaSegment.create();
      this.entityId = this.personaSegment.getEntityId();

      // 3. Save the content-scoring row. Void endpoint — no id in the response.
      const saveResult = await postContentScoringSaveTool.handler(
        {
          items: [
            {
              id: 0,
              entityId: this.entityId,
              documentUnique: this.documentUnique,
              culture: null,
              score: 1,
              isLocked: false,
              type: "Persona",
            },
          ],
        },
        context,
      );
      if (saveResult.isError) {
        throw new Error(
          `Failed to save content-scoring row: ${JSON.stringify(saveResult.content)} structuredContent=${JSON.stringify(saveResult.structuredContent)}`,
        );
      }

      // 4. Look up the row's real id by re-listing and matching on entityId.
      const allResult = await getContentScoringAllTool.handler(
        { unique: this.documentUnique },
        context,
      );
      if (allResult.isError) {
        throw new Error(
          `Failed to list content-scoring rows for lookup: ${JSON.stringify(allResult.content)}`,
        );
      }
      const items = (allResult.structuredContent as { items: { id: number; entityId: number }[] })
        .items;
      const row = items.find((item) => item.entityId === this.entityId);
      if (!row) {
        throw new Error(
          `Saved content-scoring row not found via get-content-scoring-all: ${JSON.stringify(
            allResult.structuredContent,
          )}`,
        );
      }
      this.rowId = row.id;

      return this;
    } catch (err) {
      await this.delete();
      throw err;
    }
  }

  getDocumentUnique(): string {
    if (!this.documentUnique) {
      throw new Error("Content-scoring fixture not created yet. Call create() first.");
    }
    return this.documentUnique;
  }

  getEntityId(): number {
    if (this.entityId === undefined) {
      throw new Error("Content-scoring fixture not created yet. Call create() first.");
    }
    return this.entityId;
  }

  /** The content-scoring row's own real numeric id, found via get-content-scoring-all. */
  getRowId(): number {
    if (this.rowId === undefined) {
      throw new Error("Content-scoring fixture not created yet. Call create() first.");
    }
    return this.rowId;
  }

  async delete(): Promise<void> {
    if (this.rowId !== undefined) {
      const context = createMockRequestHandlerExtra();
      try {
        await deleteContentScoringPersonaTool.handler({ id: this.rowId }, context);
      } catch {
        // ignore cleanup errors
      }
      this.rowId = undefined;
    }

    await this.personaSegment.delete();
    this.entityId = undefined;

    await this.contentPage.delete();
    this.documentUnique = undefined;
  }
}
