import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestRuntimeIndicationBody, postAbTestRuntimeIndicationResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAbTestRuntimeIndicationBody>;

// This endpoint is a pure, side-effect-free calculation - confirmed
// empirically (see post-ab-test-runtime-indication.test.ts) that feeding a
// real, persisted test's own data through it produces numerically identical
// results to a blank draft. It never needs a real goal or content page, so
// only the handful of fields that actually change the computed numbers are
// exposed here; everything else is synthesized as inert structural
// boilerplate matching get-ab-test-empty's own draft shape.
const inputSchema = z.object({
  testType: z.enum(['SinglePage', 'MultiPage', 'ContentType', 'SplitUrl']).default('SinglePage'),
  participationPercentage: z.number().default(1),
  minimumDetectableEffect: z.number().default(0.1),
  estimatedDailyVisitors: z.number().default(0),
  baselineConversionRate: z.number().default(0.05),
  variantCount: z.number().int().min(2).default(2),
});
const outputSchema = postAbTestRuntimeIndicationResponse;

function buildVariantStub(index: number): FullBody["variants"][number] {
  return {
    id: 0,
    unique: randomUUID(),
    abTestId: 0,
    name: index === 0 ? "Original" : `Variant ${String.fromCharCode(65 + index)}`,
    description: null,
    redirectNodeKey: null,
    css: null,
    javascript: null,
    created: new Date().toISOString(),
    createdByUmbracoUserKey: "00000000-0000-0000-0000-000000000000",
    isBenchmark: index === 0,
    disabled: null,
    disabledByUmbracoUserKey: null,
    isDisabled: false,
    segment: null,
    totalPageviewsForVariant: 0,
    totalVisitorsForVariant: 0,
  };
}

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-runtime-indication",
  description:
    "Estimate how long an A/B test would need to run to reach statistical significance, given participation rate, minimum detectable effect, expected daily visitors, baseline conversion rate, and variant count. This is a pure calculation - it does not require or reference any real, persisted A/B test, goal, or content page.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      unique: randomUUID(),
      created: new Date().toISOString(),
      projectId: null,
      goalId: null,
      status: "Draft",
      goal: null,
      name: null,
      description: null,
      createdByUmbracoUserName: null,
      testType: params.testType,
      startTime: null,
      endTime: null,
      participationPercentage: params.participationPercentage,
      minimumDetectableEffect: params.minimumDetectableEffect,
      variants: Array.from({ length: params.variantCount }, (_, i) => buildVariantStub(i)),
      umbracoPageVariants: [],
      contentTypes: [],
      winner: null,
      isCompleted: false,
      completedOn: null,
      completedByUmbracoUserKey: null,
      stoppedByUmbracoUserKey: null,
      estimatedDailyVisitors: params.estimatedDailyVisitors,
      baselineConversionRate: params.baselineConversionRate,
      viableVisitorThreshold: null,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAbTestRuntimeIndication"]>, ApiClient>(
      (client) => client.postAbTestRuntimeIndication(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
