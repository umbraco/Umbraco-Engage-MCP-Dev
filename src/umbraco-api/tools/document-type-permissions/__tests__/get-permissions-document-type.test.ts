import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../get/get-permissions-document-type.js";

// Same safe-range rationale as the sibling post-permissions-document-type.test.ts:
// real Umbraco content type ids are small auto-increment integers, so a fresh
// random id from this range can never collide with a real content type's row.
const TEST_CONTENT_TYPE_ID = Math.floor(Math.random() * 1_000_000_000) + 1_000_000_000;

describe("get-permissions-document-type", () => {
  setupTestEnvironment();

  // Empirically verified: querying by a contentTypeId that has no stored
  // permission row does NOT 404. The real Engage server returns a normal 200
  // with a synthetic/default entry instead — id: 0, all permission flags
  // defaulted to true, contentTypeName null, "updated" set to the current
  // request time, and updatedByUmbracoUserKey/updatedByUmbracoUser set to
  // whichever account is calling the API — echoing back the requested
  // contentTypeId. Since this is a genuine success response, it's
  // snapshot-worthy once those volatile, per-run/per-environment fields are
  // normalized out.
  it("returns a default permission entry for a non-existent content type id", async () => {
    const result = await tool.handler(
      { contentTypeId: TEST_CONTENT_TYPE_ID },
      createMockRequestHandlerExtra(),
    );

    expect(result.isError).toBeFalsy();

    const content = result.structuredContent as Record<string, unknown>;
    const normalizedContent = {
      ...(normalizeVolatileFields(content) as Record<string, unknown>),
      // Our own randomly-generated test value, not a stable id the SDK's
      // GUID-based id normalization understands (it's a plain number) — the
      // response simply echoes back whatever we queried with, so blank it.
      contentTypeId: 0,
      // Not covered by normalizeVolatileFields's INSTALL_IDENTITY_FIELDS list
      // (that only covers "createdByUmbracoUserName") — this endpoint's
      // default response instead echoes the calling account's display name
      // under "updatedByUmbracoUser", so normalize it locally here rather
      // than extend the shared helper for a single field.
      updatedByUmbracoUser: "NORMALIZED_USER",
    };

    expect(
      createSnapshotResult({ ...result, structuredContent: normalizedContent }),
    ).toMatchSnapshot();
  });
});
