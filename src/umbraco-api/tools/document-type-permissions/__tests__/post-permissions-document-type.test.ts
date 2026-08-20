import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-permissions-document-type.js";

describe("post-permissions-document-type", () => {
  setupTestEnvironment();

  // Sibling collection to user-group-permissions, which turned out to be
  // insert-only (never an upsert) and to write asynchronously — calling it
  // against an id that already has a stored row creates a duplicate that
  // permanently crashes the real Engage server's GetAll() (see
  // post-permissions-user-group.test.ts for the full story). Applying the
  // same caution here without re-verifying against a real contentTypeId:
  // use a random, never-before-seen contentTypeId every run (so a rerun
  // can never collide with a row a prior run left behind — there's no
  // delete endpoint for this resource either), and don't assert immediate
  // get-all visibility in case the write is likewise eventually consistent.
  it("creates a permission entry for a content type id", async () => {
    const contentTypeId = Math.floor(Math.random() * 1_000_000_000) + 1_000_000_000;

    const result = await postTool.handler(
      {
        items: [
          {
            id: 0,
            contentTypeId,
            contentTypeName: "_Test Content Type",
            showAnalytics: true,
            allowAbTesting: true,
            allowScorePersonalization: true,
            allowApplyPersonalization: true,
            updated: new Date().toISOString(),
            updatedByUmbracoUserKey: crypto.randomUUID(),
            updatedByUmbracoUser: null,
          },
        ],
      } as any,
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();
  });
});
