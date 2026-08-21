import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postSegmentsBody, postSegmentsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postSegmentsBody>;

// This single endpoint both CREATES a new segment (omit `id`/`unique`) and
// UPDATES an existing one (supply the real `id`/`unique` from a prior
// get-segments-all call) - there is no separate update tool, matching the
// same pattern as post-campaign-group/post-referral-group. `rules` defaults
// to empty, which is correct for create but will WIPE the segment's
// targeting rules on an update if omitted there too - pass the current
// rules back (from get-segments-all) if updating a segment that has any.
const inputSchema = z.object({
  id: postSegmentsBody.shape.id.optional().describe("Omit to create a new segment. Supply the existing numeric id (from get-segments-all) to update it."),
  unique: postSegmentsBody.shape.unique.optional().describe("Omit to create a new segment (server-generated). Supply the existing guid to update it."),
  name: z.string().nullish(),
  description: z.string().nullish(),
  endTime: postSegmentsBody.shape.endTime.default(null),
  isTemporary: postSegmentsBody.shape.isTemporary.default(false),
  sortOrder: postSegmentsBody.shape.sortOrder.default(0),
  controlGroupSize: postSegmentsBody.shape.controlGroupSize.default(0),
  rules: z
    .array(
      z.object({
        type: z.string().nullish().describe("The rule type identifier (not documented upstream - inspect an existing segment's rules via get-segments-all for real examples)."),
        config: z.unknown().nullish().describe("Rule-type-specific configuration; shape depends on `type`."),
        isNegation: z.boolean().default(false),
      }),
    )
    .default([])
    .describe("Targeting rules for this segment. WARNING: on update this replaces the full rule list - omitting it wipes existing rules."),
});
const outputSchema = postSegmentsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-segments",
  description:
    "Create a new visitor segment, or update an existing one (supply its real `id`/`unique` to update instead of create). A segment groups visitors by targeting rules and is used for reporting and personalization.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create", "update"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const now = new Date().toISOString();
    const id = params.id ?? 0;
    const body: FullBody = {
      id,
      created: now,
      unique: params.unique ?? randomUUID(),
      name: params.name ?? null,
      description: params.description ?? null,
      endTime: params.endTime,
      isTemporary: params.isTemporary,
      sortOrder: params.sortOrder,
      controlGroupSize: params.controlGroupSize,
      rules: params.rules.map((rule) => ({
        id: 0,
        unique: randomUUID(),
        segmentId: id,
        type: rule.type,
        config: rule.config,
        isNegation: rule.isNegation,
        created: now,
      })),
    };
    return executeGetApiCall<ReturnType<ApiClient["postSegments"]>, ApiClient>(
      (client) => client.postSegments(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
