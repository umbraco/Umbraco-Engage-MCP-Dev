import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "../setup.js";
import {
  DocumentTypeFixture,
  disconnectChainedCms,
  TEST_CONTENT_TYPE_ALIAS,
} from "./document-type-fixture.js";
import getContentTypesAllTool from "../../get/get-content-types-all.js";

// Round-trips through the chained CMS MCP (spawns a child process on first
// use) plus multiple Engage API calls - the default 5s Jest timeout is too
// tight.
jest.setTimeout(30000);

describe("DocumentTypeFixture", () => {
  setupTestEnvironment();

  let fixture: DocumentTypeFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("creates a real document type visible to get-content-types-all", async () => {
    fixture = await new DocumentTypeFixture().create();

    expect(fixture.getId()).toBeDefined();

    const result = await getContentTypesAllTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { alias: string }[] }).items;
    expect(items.some((item) => item.alias === TEST_CONTENT_TYPE_ALIAS)).toBe(true);
  });

  it("throws when getId() is called before create()", () => {
    const fresh = new DocumentTypeFixture();
    expect(() => fresh.getId()).toThrow();
  });

  it("deletes the created document type", async () => {
    fixture = await new DocumentTypeFixture().create();

    await fixture.delete();
    fixture = undefined;

    const result = await getContentTypesAllTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    const items = (result.structuredContent as { items: { alias: string }[] }).items;
    expect(items.some((item) => item.alias === TEST_CONTENT_TYPE_ALIAS)).toBe(false);
  });
});
