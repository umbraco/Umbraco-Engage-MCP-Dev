import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postCampaignGroupBody, postCampaignGroupResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postCampaignGroupBody>;

// This single endpoint both CREATES a new campaign group (omit `id`/
// `unique`) and UPDATES an existing one (supply the real `id`/`unique`
// from a prior get-campaign-group call) - there is no separate update
// tool. `campaigns`/`customerJourneyScoring`/`personaScoring` default to
// empty, which is correct for create but will WIPE those associations on
// an update if omitted there too - pass the current arrays back (from
// get-campaign-group) if updating a group that has any.
const inputSchema = z.object({
  id: postCampaignGroupBody.shape.id.optional().describe("Omit to create a new group. Supply the existing numeric id to update it."),
  unique: postCampaignGroupBody.shape.unique.optional().describe("Omit to create a new group (server-generated). Supply the existing guid to update it."),
  name: z.string().nullish(),
  description: z.string().nullish(),
  invalid: postCampaignGroupBody.shape.invalid.default(false),
  campaigns: postCampaignGroupBody.shape.campaigns.default([]),
  customerJourneyScoring: postCampaignGroupBody.shape.customerJourneyScoring.default([]),
  personaScoring: postCampaignGroupBody.shape.personaScoring.default([]),
});
const outputSchema = postCampaignGroupResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-campaign-group",
  description:
    "Create a new campaign group, or update an existing one (supply its real `id`/`unique` to update instead of create). A campaign group organizes campaigns and optionally links persona/customer-journey scoring rules to them.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create", "update"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: params.id ?? 0,
      created: new Date().toISOString(),
      unique: params.unique ?? randomUUID(),
      name: params.name ?? null,
      description: params.description ?? null,
      invalid: params.invalid,
      campaigns: params.campaigns,
      customerJourneyScoring: params.customerJourneyScoring,
      personaScoring: params.personaScoring,
    };
    return executeGetApiCall<ReturnType<ApiClient["postCampaignGroup"]>, ApiClient>(
      (client) => client.postCampaignGroup(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
