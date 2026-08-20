import { jest } from "@jest/globals";
import { ContentPageFixture, disconnectChainedCms } from "../content-page-fixture.js";

jest.setTimeout(30000);

describe("ContentPageFixture", () => {
  let fixture: ContentPageFixture | undefined;

  afterEach(async () => {
    if (fixture) await fixture.delete();
    fixture = undefined;
  });

  afterAll(async () => {
    await disconnectChainedCms();
  });

  it("creates and publishes a real content page, exposing its key", async () => {
    fixture = await new ContentPageFixture().create();

    expect(typeof fixture.getId()).toBe("string");
    expect(fixture.getId()).toMatch(/^[0-9a-f-]{36}$/i);
    expect(fixture.getKey()).toBe(fixture.getId());
  });

  it("deletes the created page and document type without error", async () => {
    fixture = await new ContentPageFixture().create();
    await fixture.delete();
    fixture = undefined;
  });
});
