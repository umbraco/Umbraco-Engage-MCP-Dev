import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getReferralGroupResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a lookup with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({
  id: z.uuid().describe("The group's `unique` guid - not the numeric `id` field on the returned entity."),
});
const outputSchema = getReferralGroupResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-referral-group",
  description:
    "Get a single referral group by its `id` - the group's `unique` guid, not the numeric `id` field on the entity itself. The response's personaScoring[].personaId and customerJourneyScoring[].customerJourneyStepId are bare foreign keys with no name attached - look them up via the persona/customer-journey collections if a human-readable label is needed.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getReferralGroup"]>, ApiClient>(
      (client) => client.getReferralGroup(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
