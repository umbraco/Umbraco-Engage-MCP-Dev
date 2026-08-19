import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getCockpitAuthDomainsTool from "../get/get-cockpit-auth-domains.js";

describe("get-cockpit-auth-domains", () => {
  setupTestEnvironment();

  it("returns whitelisted Cockpit domains", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getCockpitAuthDomainsTool.handler({}, context);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
