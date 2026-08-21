import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-permissions-document-type.js";

const TEST_CONTENT_TYPE_NAME = "_Test Content Type";

describe("post-permissions-document-type", () => {
  setupTestEnvironment();

  // IMPORTANT — verified empirically the hard way on the sibling
  // user-group-permissions collection (same underlying pattern applies
  // here): this endpoint is insert-only (never an upsert) and writes
  // asynchronously (the response can return success before the row is
  // actually persisted, so a follow-up get-permissions-document-type-all
  // call could race ahead of the write and not see it yet — not asserted
  // here for that reason).
  //
  // Calling this against a contentTypeId that ALREADY has a stored
  // permission row creates a SECOND row for that same id. The real Engage
  // server's GetAll() for the sibling user-group-permissions collection
  // does `rows.ToDictionary(x => x.userGroupKey)` with no duplicate
  // handling, and this document-type-permissions table follows the same
  // shape — a second row for an existing id would permanently crash
  // get-permissions-document-type-all (500) for every caller. There's also
  // no delete endpoint for this resource, so a bad row can never be
  // cleaned up via the API.
  //
  // The fix: always use a fresh, random contentTypeId far outside the
  // range of any real content type (real Umbraco content type ids are
  // small auto-increment integers), generated fresh on every run, so it
  // can never collide with a real content type's row. This does
  // permanently add an orphan row on every run (accepted — this demo
  // instance's database is periodically recycled).
  it("creates a permission entry for a new content type id", async () => {
    const contentTypeId = Math.floor(Math.random() * 1_000_000_000) + 1_000_000_000;

    const result = await postTool.handler(
      {
        items: [
          {
            contentTypeId,
            contentTypeName: TEST_CONTENT_TYPE_NAME,
            showAnalytics: true,
            allowAbTesting: true,
            allowScorePersonalization: true,
            allowApplyPersonalization: true,
            updatedByUmbracoUser: null,
          },
        ],
      },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();
  }, 15000);
});
