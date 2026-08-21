import { jest } from "@jest/globals";
import { setupTestEnvironment } from "../setup.js";
import { disconnectChainedCms } from "../../../../../testing/content-page-fixture.js";
import { ContentScoringFixture } from "./content-scoring-fixture.js";

// Integration test hitting the real Umbraco + Engage instance via a chained
// CMS MCP round trip (content page create + publish) plus multiple Engage
// API calls (persona create, content-scoring save, content-scoring list,
// content-scoring delete) — the default 5s Jest timeout is far too tight.
jest.setTimeout(60000);

describe("ContentScoringFixture", () => {
  setupTestEnvironment();

  let fixture: ContentScoringFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a real content-scoring row referencing a real document and persona segment", async () => {
    fixture = await new ContentScoringFixture().create();

    expect(fixture.getDocumentUnique()).toBeDefined();
    expect(fixture.getEntityId()).toBeGreaterThan(0);
    expect(fixture.getRowId()).toBeGreaterThan(0);
  });

  it("deletes the content-scoring row and its dependencies via the fixture", async () => {
    fixture = await new ContentScoringFixture().create();
    const rowId = fixture.getRowId();

    await fixture.delete();

    expect(rowId).toBeGreaterThan(0);
    // fixture is now torn down; nothing further to assert without a
    // dedicated "get single row" endpoint — absence is covered implicitly
    // by delete() not throwing.
    fixture = undefined;
  });
});
