import { jest } from "@jest/globals";
import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import postAbTestTool from "../post/post-ab-test.js";
import getAbTestViewModelTool from "../get/get-ab-test-view-model.js";
import getAbTestProjectTool from "../../ab-test-project/get/get-ab-test-project.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
import { AbTestProjectBuilder } from "../../ab-test-project/__tests__/helpers/ab-test-project-builder.js";
import { disconnectChainedCms } from "../../../../testing/content-page-fixture.js";

jest.setTimeout(60000);

describe("post-ab-test", () => {
  setupTestEnvironment();

  afterAll(async () => {
    await disconnectChainedCms();
  }, 30000);

  it("returns a raw 500 error for a genuinely non-existent goalId", async () => {
    const context = createMockRequestHandlerExtra();

    // Verified empirically: a `goalId` that doesn't correspond to ANY real
    // goal row (as opposed to a real goal row with mismatched/invalid
    // characteristics - see the next test) trips the database's foreign key
    // constraint on insert, surfacing as a raw, unhandled 500 with a full
    // C# stack trace rather than a graceful validationResults.isValid=false.
    const result = await postAbTestTool.handler(
      {
        name: "_Test AB Test Invalid Goal",
        testType: "SinglePage",
        goalId: 999999,
        goal: {
          key: randomUUID(),
          value: 1,
          goalTypeId: "00000000-0000-0000-0000-000000000000",
          goalTypeConfig: "{}",
          isMain: false,
          isInverted: false,
          isActive: true,
          isInvalid: false,
        },
        pageUnique: randomUUID(),
        secondVariantPageUnique: undefined,
        projectId: undefined,
        secondVariantName: "Variant B",
        participationPercentage: 1,
        minimumDetectableEffect: 0.1,
        estimatedDailyVisitors: 0,
        baselineConversionRate: 0.05,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(String(result.structuredContent)).toContain("FOREIGN KEY constraint");
  });

  it("creates a real, persisted A/B test from minimal caller-supplied fields", async () => {
    // AbTestBuilder calls this exact tool with the same minimal schema - the
    // real dependency chain (a real goal, a real published content page) is
    // exactly what this tool needs, so this documents post-ab-test's own
    // happy path rather than duplicating that setup by hand here.
    const builder = await new AbTestBuilder().create();

    expect(typeof builder.getId()).toBe("number");
    expect(builder.getId()).toBeGreaterThan(0);

    await builder.delete();
  });

  it("without projectId, a real created test never appears under any A/B test project", async () => {
    // Confirmed empirically (Umbraco.Engage.Infrastructure.AbTesting.Project's
    // AbTestProjectMapper/AbTestProjectRepository): a project's `abTests` are
    // populated strictly from tests whose `projectId` FK matches - `test`
    // and `project` are otherwise unrelated rows. Omitting `projectId` (the
    // old, only behavior of this tool) produces a real, valid, persisted
    // test that get-ab-test-project will never surface for any project.
    const context = createMockRequestHandlerExtra();
    const project = await new AbTestProjectBuilder()
      .withUnique(randomUUID())
      .withName("_Test AB Test Project - orphan check")
      .create();
    const testBuilder = await new AbTestBuilder().create();

    const result = await getAbTestProjectTool.handler(
      { id: project.getId() },
      context,
    );

    expect(result.isError).toBeFalsy();
    const abTests = (result.structuredContent as { abTests: { unique: string }[] })
      .abTests;
    expect(abTests.some((t) => t.unique === testBuilder.getUnique())).toBe(false);

    await testBuilder.delete();
    await project.delete();
  });

  it("with projectId, the created test appears under that A/B test project", async () => {
    const context = createMockRequestHandlerExtra();
    const project = await new AbTestProjectBuilder()
      .withUnique(randomUUID())
      .withName("_Test AB Test Project - assigned check")
      .create();
    const testBuilder = await new AbTestBuilder()
      .withProjectId(project.getNumericId())
      .create();

    const result = await getAbTestProjectTool.handler(
      { id: project.getId() },
      context,
    );

    expect(result.isError).toBeFalsy();
    const abTests = (result.structuredContent as { abTests: { unique: string }[] })
      .abTests;
    expect(abTests.some((t) => t.unique === testBuilder.getUnique())).toBe(true);

    await testBuilder.delete();
    await project.delete();
  });

  const minimalSplitUrlParams = {
    name: "_Test AB Test SplitUrl Validation",
    testType: "SplitUrl" as const,
    goalId: 1,
    goal: {
      key: randomUUID(),
      value: 1,
      goalTypeId: "00000000-0000-0000-0000-000000000000",
      goalTypeConfig: "{}",
      isMain: false,
      isInverted: false,
      isActive: true,
      isInvalid: false,
    },
    secondVariantName: "Variant B",
    participationPercentage: 1,
    minimumDetectableEffect: 0.1,
    estimatedDailyVisitors: 0,
    baselineConversionRate: 0.05,
  };

  it("rejects a SplitUrl test with no secondVariantPageUnique before making any API call", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestTool.handler(
      {
        ...minimalSplitUrlParams,
        pageUnique: randomUUID(),
        secondVariantPageUnique: undefined,
        projectId: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "secondVariantPageUnique is required",
    );
  });

  it("rejects a non-SplitUrl test that supplies secondVariantPageUnique", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await postAbTestTool.handler(
      {
        ...minimalSplitUrlParams,
        testType: "SinglePage",
        pageUnique: randomUUID(),
        secondVariantPageUnique: randomUUID(),
        projectId: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "only valid for testType SplitUrl",
    );
  });

  it("rejects a SplitUrl test whose secondVariantPageUnique matches pageUnique", async () => {
    const context = createMockRequestHandlerExtra();
    const samePage = randomUUID();

    const result = await postAbTestTool.handler(
      {
        ...minimalSplitUrlParams,
        pageUnique: samePage,
        secondVariantPageUnique: samePage,
        projectId: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(
      "must differ from pageUnique",
    );
  });

  it("creates a real SplitUrl test with each variant pinned to its own page", async () => {
    // Proves the other half of A2 ("each variant pinned to its page"):
    // confirmed via decompiling AbTestSaveHandler.SetVariantNamesToNodeSegments,
    // which matches each variant's redirectNodeKey against UmbracoPageVariants
    // by key - the benchmark variant must redirect to `pageUnique` and the
    // second variant to `secondVariantPageUnique`, not share one page.
    const builder = await new AbTestBuilder().withSplitUrl().create();

    const context = createMockRequestHandlerExtra();
    const result = await getAbTestViewModelTool.handler(
      { unique: builder.getUnique() },
      context,
    );

    expect(result.isError).toBeFalsy();
    const variants = (
      result.structuredContent as {
        test: { variants: { isBenchmark: boolean; redirectNodeKey: string | null }[] };
      }
    ).test.variants;

    const benchmark = variants.find((v) => v.isBenchmark);
    const second = variants.find((v) => !v.isBenchmark);
    expect(benchmark?.redirectNodeKey).toBe(builder.getPageKey());
    expect(second?.redirectNodeKey).toBe(builder.getSecondVariantPageKey());

    await builder.delete();
  });
});
