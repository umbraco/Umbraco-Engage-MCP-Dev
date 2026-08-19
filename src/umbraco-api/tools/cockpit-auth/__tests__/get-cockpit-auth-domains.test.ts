import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getCockpitAuthDomainsTool from "../get/get-cockpit-auth-domains.js";
import { DomainFixture, disconnectChainedCms } from "./helpers/domain-fixture.js";

describe("get-cockpit-auth-domains", () => {
  setupTestEnvironment();

  const domain = new DomainFixture();

  beforeAll(async () => {
    await domain.create();
  }, 30_000);

  afterAll(async () => {
    await domain.delete();
    await disconnectChainedCms();
  }, 30_000);

  it("returns whitelisted Cockpit domains", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getCockpitAuthDomainsTool.handler({}, context);
    const snapshot = createSnapshotResult(result) as any;
    // rootContentId is Umbraco's auto-increment integer node id — it is not a
    // GUID, so the SDK's generic `id` normalization doesn't cover it, and it
    // is never reproducible across environments/runs. Normalize it locally,
    // the same way createSnapshotResult normalizes GUIDs and dates.
    for (const d of snapshot?.structuredContent?.domains ?? []) {
      if (typeof d.rootContentId === "number") d.rootContentId = 0;
    }
    expect(snapshot).toMatchSnapshot();
  });
});
