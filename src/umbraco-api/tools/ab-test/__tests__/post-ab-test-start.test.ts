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

describe("post-ab-test-start", () => {
  setupTestEnvironment();

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("starts a Draft test immediately when startTime is omitted", async () => {
    // Confirmed via decompiling AbTestDtoMapper.Map: the response's
    // `status` field is read straight off the domain model's computed
    // `Status` property (`abTestDto.Status = abTest.Status`), so a real
    // "Running" here proves the status is genuinely derived from the
    // startTime we just set - not merely echoed back from the request.
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestStartTool.handler(
      {
        unique: builder.getUnique(),
        startTime: undefined,
        pageUnique: builder.getPageKey(),
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const test = (result.structuredContent as { test: { test: { status: string; startTime: string } } })
      .test.test;
    expect(test.status).toBe("Running");
    expect(test.startTime).toBeTruthy();

    await builder.delete();
  });

  it("schedules a test for the future instead of starting it immediately", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();
    const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const result = await postAbTestStartTool.handler(
      {
        unique: builder.getUnique(),
        startTime: futureStart,
        pageUnique: builder.getPageKey(),
        secondVariantPageUnique: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    const test = (result.structuredContent as { test: { test: { status: string } } }).test.test;
    expect(test.status).toBe("Scheduled");

    await builder.delete();
  });

  it("rejects restarting an already-stopped test", async () => {
    // Confirmed empirically in the real backoffice UI (not just this API):
    // a Stopped test's only available action is "Select winner" (-> Completed)
    // - there is no resume/restart feature anywhere in Engage. Also confirmed
    // separately that clearing endTime back to null via this save endpoint
    // doesn't persist even when attempted, consistent with Stopped being a
    // genuinely terminal state rather than something this tool works around.
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();
    const pageUnique = builder.getPageKey();

    await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique, secondVariantPageUnique: undefined },
      context,
    );
    await postAbTestStopTool.handler(
      {
        unique: builder.getUnique(),
        endTime: undefined,
        isCompleted: undefined,
        pageUnique,
        secondVariantPageUnique: undefined,
      },
      context,
    );

    const result = await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique, secondVariantPageUnique: undefined },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "Cannot restart an already-stopped test",
    );

    await builder.delete();
  });

  it("preserves the test's real page configuration despite get-ab-test-view-model not reading it back", async () => {
    // The whole point of requiring `pageUnique` here: prove the started
    // test's umbracoPageVariants still resolves to the SAME real page via
    // get-ab-test-page (an unaffected lookup - see post-ab-test-start's own
    // description), not silently wiped by the buggy read-back.
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();

    await postAbTestStartTool.handler(
      { unique: builder.getUnique(), startTime: undefined, pageUnique: builder.getPageKey(), secondVariantPageUnique: undefined },
      context,
    );

    const { default: getAbTestPageTool } = await import("../get/get-ab-test-page.js");
    const pageResult = await getAbTestPageTool.handler({ unique: builder.getPageKey() }, context);

    expect(pageResult.isError).toBeFalsy();
    const items = (pageResult.structuredContent as { items: { unique: string }[] }).items;
    expect(items.some((t) => t.unique === builder.getUnique())).toBe(true);

    await builder.delete();
  });

  it("rejects secondVariantPageUnique for a non-SplitUrl test", async () => {
    const builder = await new AbTestBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestStartTool.handler(
      {
        unique: builder.getUnique(),
        startTime: undefined,
        pageUnique: builder.getPageKey(),
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

    const result = await postAbTestStartTool.handler(
      { unique: randomUUID(), startTime: undefined, pageUnique: randomUUID(), secondVariantPageUnique: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
