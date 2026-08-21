import { jest } from "@jest/globals";
import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import postAbTestTool from "../post/post-ab-test.js";
import { AbTestBuilder } from "./helpers/ab-test-builder.js";
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
});
