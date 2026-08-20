import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-permissions-user-group.js";

describe("post-permissions-user-group", () => {
  setupTestEnvironment();

  // IMPORTANT — verified empirically the hard way: this endpoint is
  // insert-only (never an upsert) and writes asynchronously (the response
  // returns success before the row is actually persisted, so a follow-up
  // get-permissions-user-group-all call can race ahead of the write and
  // not see it yet — not asserted here for that reason). It also does not
  // validate userGroupKey against real Umbraco user groups; any uuid is
  // accepted and eventually persisted as its own row.
  //
  // Calling this against a userGroupKey that ALREADY has a stored
  // permission row creates a SECOND row for that same key. The real Engage
  // server's GetAll() does `rows.ToDictionary(x => x.userGroupKey)` with no
  // duplicate handling, so a second row for an existing key permanently
  // crashes get-permissions-user-group-all (500: "An item with the same
  // key has already been added") for every caller, not just this test.
  // There's also no delete endpoint for this resource, so a bad row can
  // never be cleaned up via the API.
  //
  // The fix: always use a *fresh, never-before-seen* userGroupKey (not a
  // real user group's key) here. That still permanently adds an orphan row
  // (accepted — this demo instance's database is periodically recycled,
  // same reasoning as the goal collection) but a fresh key can never
  // collide with a real group's row, so it can never trigger the
  // duplicate-key crash for anyone else.
  it("creates a permission entry for a new user group key", async () => {
    const result = await postTool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        userGroupKey: crypto.randomUUID(),
        userGroupName: "_Test User Group",
        userGroupAlias: "_testUserGroup",
        userGroupIconUrl: null,
        accessToAnalytics: true,
        accessToAbTesting: true,
        accessToPersonalization: true,
        accessToSettings: true,
        accessToProfiles: true,
        accessToReporting: true,
        updated: new Date().toISOString(),
        updatedByUmbracoUserKey: crypto.randomUUID(),
        updatedByUmbracoUser: null,
      } as any,
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();
  });
});
