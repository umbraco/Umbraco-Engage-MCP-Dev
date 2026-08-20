import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import postTool from "../post/post-permissions-user-group.js";

describe("post-permissions-user-group", () => {
  setupTestEnvironment();

  // IMPORTANT — verified empirically the hard way on this exact collection
  // this session: this endpoint is insert-only (never an upsert) and writes
  // asynchronously (the response can return success before the row is
  // actually persisted, so a follow-up get-permissions-user-group-all call
  // could race ahead of the write and not see it yet — not asserted here
  // for that reason).
  //
  // Calling this against a userGroupKey that ALREADY has a stored
  // permission row creates a SECOND row for that same key. The real Engage
  // server's GetAll() does `rows.ToDictionary(x => x.userGroupKey)` with no
  // duplicate handling — a second row for an existing key PERMANENTLY
  // CRASHES get-permissions-user-group-all (500, "An item with the same
  // key has already been added") for every caller, not just this test.
  // This actually happened this session and required a direct SQL DELETE
  // against the demo database to recover, since there's no delete
  // endpoint for this resource either.
  //
  // The fix/mitigation, mandatory: always use a completely fresh,
  // never-before-seen userGroupKey — crypto.randomUUID(), freshly
  // generated inside the test, never a fixed constant, never a real
  // existing user group's key (never call get-permissions-user-group-all
  // first and reuse one of its keys). This guarantees the insert can never
  // collide with any real row. This does permanently add an orphan row on
  // every run (accepted — no delete endpoint exists, this demo instance's
  // database is periodically recycled) — the ONLY thing that must never
  // happen is reusing an existing key.
  it("creates a permission entry for a new user group key", async () => {
    const userGroupKey = crypto.randomUUID();

    const result = await postTool.handler(
      {
        id: 0,
        unique: crypto.randomUUID(),
        userGroupKey,
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
      },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();
  });
});
