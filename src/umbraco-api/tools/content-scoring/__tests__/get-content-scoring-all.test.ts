import { jest } from "@jest/globals";
import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";
import { ContentScoringFixture } from "./helpers/content-scoring-fixture.js";
import tool from "../get/get-content-scoring-all.js";

jest.setTimeout(60000);

describe("get-content-scoring-all", () => {
  setupTestEnvironment();

  // `unique` is now required in the tool's own schema (a real MCP caller
  // can no longer omit it) - this still documents the real 400 that
  // motivated that change, via a direct handler call that bypasses schema
  // validation. Also confirmed empirically: a syntactically-valid but
  // non-existent uuid gets the identical 400.
  it("returns a 400 error when unique is omitted despite being marked optional", async () => {
    const result = await tool.handler(
      { unique: undefined } as unknown as { unique: string },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  describe("with a real document", () => {
    let fixture: ContentScoringFixture | undefined;

    afterEach(async () => {
      if (fixture) await fixture.delete();
      fixture = undefined;
    });

    afterAll(async () => {
      await disconnectChainedCms();
    }, 30000);

    // A real document's unique now succeeds — a genuine content-scoring row
    // fixture (ContentPageFixture + PersonaSegmentBuilder) is available this
    // session, so this is no longer out of reach as previously documented.
    it("returns the real content-scoring row for a real document's unique", async () => {
      fixture = await new ContentScoringFixture().create();

      const result = await tool.handler(
        { unique: fixture.getDocumentUnique() },
        createMockRequestHandlerExtra(),
      );

      expect(result.isError).toBeFalsy();
      const structuredContent = normalizeVolatileFields(
        createSnapshotResult(result),
      ) as { structuredContent?: { items?: { id: number; entityId: number; documentUnique: string }[] } };
      const items = structuredContent.structuredContent?.items ?? [];
      expect(items.some((item) => item.entityId === fixture!.getEntityId())).toBe(true);
    });
  });
});
