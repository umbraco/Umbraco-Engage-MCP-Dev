import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileCustomerJourneyStepScoresQueryParams, getProfileCustomerJourneyStepScoresResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getProfileCustomerJourneyStepScoresQueryParams;
const outputSchema = z.object({ items: getProfileCustomerJourneyStepScoresResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-customer-journey-step-scores",
  description:
    "List a visitor's customer-journey-step scores. `visitorId` is required in practice (from get-profile-details or get-profile-related). `groupId`/`customerJourneyStepId` resolve via get-customer-journey-all/-details.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getProfileCustomerJourneyStepScores"]>, ApiClient>(
      (client) => client.getProfileCustomerJourneyStepScores(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
