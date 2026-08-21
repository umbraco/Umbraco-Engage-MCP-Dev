import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postGoalBody, postGoalResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postGoalBody>;
type PersonaScoringRow = FullBody["implicitPersonaScoring"][number];
type JourneyScoringRow = FullBody["implicitCustomerJourneyStepScoring"][number];

const scoreTypeSchema = postGoalBody.shape.implicitPersonaScoring.element.shape.scoreType;

const personaScoringRuleSchema = z.object({
  personaId: z.number().describe("The persona group's numeric id (from get-persona-all)."),
  entityId: z.number().describe(
    "The specific persona's SEGMENT sub-entity id (personas[N].id from get-persona-details) - NOT the persona group's own id/unique.",
  ),
  nodeId: z.number(),
  culture: z.string().nullish(),
  score: z.number(),
  isLocked: z.boolean().default(false),
  scoreType: scoreTypeSchema,
});
const journeyScoringRuleSchema = z.object({
  customerJourneyStepId: z.number().describe("A customer journey step's numeric id (from get-customer-journey-details)."),
  entityId: z.number().describe(
    "The specific scoring sub-entity's id, analogous to implicitPersonaScoring's entityId - exact semantics unconfirmed for journey steps.",
  ),
  nodeId: z.number(),
  culture: z.string().nullish(),
  score: z.number(),
  isLocked: z.boolean().default(false),
  scoreType: scoreTypeSchema,
});

// `id`/`unique` (top-level and per scoring rule) are mechanical - the
// server accepts and simply echoes back whatever top-level `unique` is
// supplied, so a caller has no real reason to invent one; synthesized
// here instead. Scoring rule items drop their own mechanical id/unique/
// created/updated fields, keeping only the real foreign keys and scoring
// fields.
const inputSchema = z.object({
  name: postGoalBody.shape.name,
  value: postGoalBody.shape.value,
  goalTypeId: postGoalBody.shape.goalTypeId.describe("A real goal type id, from get-goal-all-types."),
  goalTypeConfig: postGoalBody.shape.goalTypeConfig,
  isMain: z.boolean().default(false),
  isInverted: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isInvalid: z.boolean().default(false),
  isImplicitScoringEnabled: z.boolean().default(false),
  implicitPersonaScoring: z.array(personaScoringRuleSchema).default([]),
  implicitCustomerJourneyStepScoring: z.array(journeyScoringRuleSchema).default([]),
});
const outputSchema = z.object({ unique: postGoalResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-goal",
  description:
    "Create a new goal (a trackable conversion event, e.g. a page visit or custom event, used by A/B tests and scoring). Returns the created goal's `unique` guid - resolve its real numeric id afterward via get-goal-details before using it as post-ab-test's `goalId`.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const now = new Date().toISOString();
    const personaScoring: PersonaScoringRow[] = params.implicitPersonaScoring.map((rule) => ({
      id: 0,
      unique: randomUUID(),
      nodeId: rule.nodeId,
      culture: rule.culture ?? null,
      created: now,
      updated: null,
      score: rule.score,
      isLocked: rule.isLocked,
      personaId: rule.personaId,
      scoreType: rule.scoreType,
      entityId: rule.entityId,
    }));
    const journeyScoring: JourneyScoringRow[] = params.implicitCustomerJourneyStepScoring.map((rule) => ({
      id: 0,
      unique: randomUUID(),
      nodeId: rule.nodeId,
      culture: rule.culture ?? null,
      created: now,
      updated: null,
      score: rule.score,
      isLocked: rule.isLocked,
      customerJourneyStepId: rule.customerJourneyStepId,
      scoreType: rule.scoreType,
      entityId: rule.entityId,
    }));
    const body: FullBody = {
      id: null,
      unique: randomUUID(),
      name: params.name,
      value: params.value,
      goalTypeId: params.goalTypeId,
      goalTypeConfig: params.goalTypeConfig,
      isMain: params.isMain,
      isInverted: params.isInverted,
      isActive: params.isActive,
      isInvalid: params.isInvalid,
      isImplicitScoringEnabled: params.isImplicitScoringEnabled,
      implicitPersonaScoring: personaScoring,
      implicitCustomerJourneyStepScoring: journeyScoring,
    };
    const result = await executeGetApiCall<ReturnType<ApiClient["postGoal"]>, ApiClient>(
      (client) => client.postGoal(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap the bare uuid.
    if (!result.isError && typeof result.structuredContent === "string") {
      return { ...result, structuredContent: { unique: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
