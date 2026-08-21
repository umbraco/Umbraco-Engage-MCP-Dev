import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postPersonaBody, postPersonaResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postPersonaBody>;

// A "Persona" resource in Engage is a GROUP that contains one or more
// individual personas in its `personas` array. `id`/`unique` (top-level and
// per nested persona) are mechanical - the server always assigns its own
// and ignores whatever is supplied (confirmed empirically), so this always
// creates a new group, never updates one by id. Threshold/deviation/limit
// fields default to the same starting values get-persona-empty returns.
const inputSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  personas: z
    .array(z.object({
      title: z.string().nullish(),
      description: z.string().nullish(),
      icon: z.string().nullish(),
      iconUrl: z.string().nullish(),
      color: z.string().nullish(),
    }))
    .default([])
    .describe("Individual personas within this group."),
  minimumParticipationScoreThreshold: z.number().default(25),
  minimumDeviationType: postPersonaBody.shape.minimumDeviationType.default("Absolute"),
  minimumDeviation: z.number().default(0),
  expirationType: postPersonaBody.shape.expirationType.default("never"),
  expiration: z.number().nullish(),
  upperScoreLimit: z.number().default(10),
});
const outputSchema = postPersonaResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-persona",
  description:
    "Create a new persona group (a named container for one or more individual personas, each scored by visitor behavior). The server always assigns its own id/unique - this always creates a new group, it does not update an existing one by id.",
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
      personas: params.personas.map((persona) => ({
        id: 0,
        unique: randomUUID(),
        title: persona.title ?? null,
        description: persona.description ?? null,
        icon: persona.icon ?? null,
        iconUrl: persona.iconUrl ?? null,
        color: persona.color ?? null,
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
      expiration: params.expiration ?? null,
      upperScoreLimit: params.upperScoreLimit,
    };
    return executeGetApiCall<ReturnType<ApiClient["postPersona"]>, ApiClient>(
      (client) => client.postPersona(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
