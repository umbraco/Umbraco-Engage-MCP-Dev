import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postGoalAllBody, postGoalAllResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postGoalAllBody;
const outputSchema = postGoalAllResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-goal-all",
  description:
    "Search goals with pagination, optional name filtering (`filterBy`), sorting (`orderBy`), and an option to include invalid goals. Despite the POST verb, this is read-only - no goal is created or modified. See get-goals-all/get-goals-main for simpler, unpaginated full-array alternatives over the same underlying goals.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postGoalAll"]>, ApiClient>(
      (client) => client.postGoalAll(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
