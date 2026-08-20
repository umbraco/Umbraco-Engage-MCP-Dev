import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../get/get-permissions-user-group.js";

// SAFETY: this must always be a freshly generated random guid, never a real
// existing user group's key — see post-permissions-user-group.test.ts for the
// full rationale (an existing key already has a stored row, and this
// endpoint's sibling insert-only POST once created a duplicate row for a real
// key that permanently crashed get-permissions-user-group-all for every
// caller). This test only ever GETs, never POSTs, so it can't itself cause
// that, but reusing a real key would defeat the point of probing the
// "no stored row" case.
const TEST_USER_GROUP_KEY = crypto.randomUUID();

describe("get-permissions-user-group", () => {
  setupTestEnvironment();

  // Empirically verified: UNLIKE the sibling document-type-permissions
  // resource (which returns a synthetic 200 default for an unrecognized id),
  // querying this endpoint with a userGroupKey that has no stored permission
  // row does NOT return a default entry. The real Engage server throws a
  // NullReferenceException in
  // Umbraco.Engage.Web.Permissions.UserGroupPermissions.UserGroupPermissionDtoMapper.Map,
  // which the controller surfaces as a genuine error response. So this is an
  // error case, not a snapshot-worthy success — assert isError only, per the
  // "assertion testing for error cases" rule (the response body is a raw .NET
  // stack trace, not stable/deterministic content worth snapshotting).
  it("returns an error for a user group key with no stored permission row", async () => {
    const result = await tool.handler(
      { userGroupKey: TEST_USER_GROUP_KEY },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBe(true);
  });
});
