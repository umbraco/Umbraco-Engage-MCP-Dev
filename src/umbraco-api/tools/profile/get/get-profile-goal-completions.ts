import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileGoalCompletionsQueryParams, getProfileGoalCompletionsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getProfileGoalCompletionsQueryParams;
const outputSchema = z.object({ items: getProfileGoalCompletionsResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-goal-completions",
  description:
    "List the Umbraco Engage Profile Goal Completions resource. Calls GET /umbraco/engage/management/api/v1/profile/goal-completions.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getProfileGoalCompletions"]>, ApiClient>(
      (client) => client.getProfileGoalCompletions(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
