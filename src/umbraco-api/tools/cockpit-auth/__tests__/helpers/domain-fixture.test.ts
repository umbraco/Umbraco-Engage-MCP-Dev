import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "../setup.js";
import { DomainFixture, disconnectChainedCms, TEST_DOMAIN_NAME } from "./domain-fixture.js";
import getCockpitAuthDomainsTool from "../../get/get-cockpit-auth-domains.js";

// Round-trips through the chained CMS MCP (create/publish document type +
// document + domain assignment) - the default 5s Jest timeout is too tight.
jest.setTimeout(30000);

describe("DomainFixture", () => {
  setupTestEnvironment();

  let fixture: DomainFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a published document with a real registered domain", async () => {
    fixture = await new DomainFixture().create();

    const result = await getCockpitAuthDomainsTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const domains = (result.structuredContent as { domains: { name: string }[] }).domains;
    expect(domains.some((d) => d.name === TEST_DOMAIN_NAME)).toBe(true);
  });

  it("deletes the document, removing the registered domain", async () => {
    fixture = await new DomainFixture().create();

    await fixture.delete();
    fixture = undefined;

    const result = await getCockpitAuthDomainsTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const domains = (result.structuredContent as { domains: { name: string }[] }).domains;
    expect(domains.some((d) => d.name === TEST_DOMAIN_NAME)).toBe(false);
  });
});
