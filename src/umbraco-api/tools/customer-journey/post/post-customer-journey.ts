import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postCustomerJourneyBody, postCustomerJourneyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postCustomerJourneyBody>;

// The server always assigns its own id/unique on save and ignores whatever
// is supplied in the request body (confirmed empirically) - so this call
// always behaves like a create, never a targeted update of an existing
// journey by id/unique. Mechanical fields (id/unique/audit timestamps, and
// the same per-step) are synthesized here; steps only expose their real
// content fields.
const inputSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  steps: z
    .array(z.object({
      title: z.string().nullish(),
      description: z.string().nullish(),
      icon: z.string().nullish(),
      iconUrl: z.string().nullish(),
      color: z.string().nullish(),
    }))
    .default([]),
  minimumParticipationScoreThreshold: z.number().default(25),
  minimumDeviationType: postCustomerJourneyBody.shape.minimumDeviationType.default("Absolute"),
  minimumDeviation: z.number().default(0),
  expirationType: postCustomerJourneyBody.shape.expirationType.default("never"),
  expiration: z.number().default(0),
  upperScoreLimit: z.number().default(10),
});
const outputSchema = postCustomerJourneyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-customer-journey",
  description:
    "Create a new customer journey (a named sequence of steps used to score visitor progression). Threshold/deviation/limit fields default to the same starting values get-customer-journey-empty returns. The server always assigns its own id/unique - this always creates a new journey, it does not update an existing one by id.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const now = new Date().toISOString();
    const body: FullBody = {
      id: 0,
      unique: randomUUID(),
      title: params.title ?? null,
      description: params.description ?? null,
      steps: params.steps.map((step) => ({
        id: 0,
        unique: randomUUID(),
        title: step.title ?? null,
        description: step.description ?? null,
        icon: step.icon ?? null,
        iconUrl: step.iconUrl ?? null,
        color: step.color ?? null,
        createdOn: now,
        createdByUmbracoUserKey: null,
        createdByUmbracoUserName: null,
        updatedOn: null,
        updatedByUmbracoUserKey: null,
        updatedByUmbracoUserName: null,
      })),
      createdOn: now,
      createdByUmbracoUserKey: null,
      createdByUmbracoUserName: null,
      updatedOn: null,
      updatedByUmbracoUserKey: null,
      updatedByUmbracoUserName: null,
      minimumParticipationScoreThreshold: params.minimumParticipationScoreThreshold,
      minimumDeviationType: params.minimumDeviationType,
      minimumDeviation: params.minimumDeviation,
      expirationType: params.expirationType,
      expiration: params.expiration,
      upperScoreLimit: params.upperScoreLimit,
    };
    return executeGetApiCall<ReturnType<ApiClient["postCustomerJourney"]>, ApiClient>(
      (client) => client.postCustomerJourney(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
