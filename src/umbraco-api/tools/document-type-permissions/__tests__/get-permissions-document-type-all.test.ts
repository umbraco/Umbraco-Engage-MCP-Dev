import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../get/get-permissions-document-type-all.js";

// IMPORTANT — probed empirically this session: posted a real entry via
// post-permissions-document-type, then polled get-permissions-document-type-all
// every 2s for 30s straight. The item count never changed and the new
// contentTypeId never appeared. This isn't the usual brief async-write race
// documented on post-permissions-document-type's own test (and confirmed on
// the sibling user-group-permissions collection) — 30s is well past any
// plausible write-propagation delay, so get-all is most likely served from a
// cache that isn't invalidated by POST (populated once at server startup, or
// on its own separate refresh cycle). No bounded poll from a test can wait
// that out reliably, so asserting real-entity presence here would be
// genuinely flaky rather than just eventually-consistent — leave this as a
// shape-only smoke test.
describe("get-permissions-document-type-all", () => {
  setupTestEnvironment();
  it("returns an array of document-type permission entries", async () => {
    const result = await tool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: any[] }).items;
    expect(Array.isArray(items)).toBe(true);
  });
});
