import { jest } from "@jest/globals";
import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import postAbTestStartTool from "../post/post-ab-test-start.js";
import postAbTestStopTool from "../post/post-ab-test-stop.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";

jest.setTimeout(60000);

describe("post-ab-test-stop", () => {
  setupTestEnvironment();

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("stops a running test, computing status Stopped when isCompleted is omitted", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();
    const pageUnique = builder.getPageKey();
    await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique, secondVariantPageUnique: undefined },
      context,
    );

    const result = await postAbTestStopTool.handler(
      {
        unique: builder.getUnique(),
        endTime: undefined,
        isCompleted: undefined,
        pageUnique,
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const test = (result.structuredContent as { test: { test: { status: string; endTime: string } } })
      .test.test;
    expect(test.status).toBe("Stopped");
    expect(test.endTime).toBeTruthy();

    await builder.delete();
  });

  it("computes status Completed when isCompleted is true", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();
    const pageUnique = builder.getPageKey();
    await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique, secondVariantPageUnique: undefined },
      context,
    );

    const result = await postAbTestStopTool.handler(
      {
        unique: builder.getUnique(),
        endTime: undefined,
        isCompleted: true,
        pageUnique,
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const test = (result.structuredContent as { test: { test: { status: string } } }).test.test;
    expect(test.status).toBe("Completed");

    await builder.delete();
  });

  it("rejects stopping a Draft test that was never started", async () => {
    // Confirmed via decompiling AbTest.DetermineAbTestStatus: with no
    // startTime the computed status stays Draft regardless of endTime, so
    // stopping a never-started test would otherwise silently no-op on the
    // real server - this tool rejects it client-side instead.
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestStopTool.handler(
      {
        unique: builder.getUnique(),
        endTime: undefined,
        isCompleted: undefined,
        pageUnique: builder.getPageKey(),
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "Cannot stop a test that was never started",
    );

    await builder.delete();
  });

  it("rejects secondVariantPageUnique for a non-SplitUrl test", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();
    const pageUnique = builder.getPageKey();
    await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique, secondVariantPageUnique: undefined },
      context,
    );

    const result = await postAbTestStopTool.handler(
      {
        unique: builder.getUnique(),
        endTime: undefined,
        isCompleted: undefined,
        pageUnique,
        secondVariantPageUnique: randomUUID(),
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "only valid for testType SplitUrl",
    );

    await builder.delete();
  });

  it("returns a real error for a non-existent unique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestStopTool.handler(
      {
        unique: randomUUID(),
        endTime: undefined,
        isCompleted: undefined,
        pageUnique: randomUUID(),
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
