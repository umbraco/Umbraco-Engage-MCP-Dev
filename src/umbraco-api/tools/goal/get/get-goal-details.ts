import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getGoalDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a lookup with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({
  id: z.uuid().describe("The goal's `unique` guid (e.g. from post-goal's response) - not its numeric `id` field."),
});
const outputSchema = getGoalDetailsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-goal-details",
  description:
    "Get a single goal's full details (including implicit scoring rules) by its `id` - the goal's `unique` guid, not its numeric `id` field. Use this to resolve the real numeric id needed by post-ab-test's `goalId`. Returns 404 for a non-existent id.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getGoalDetails"]>, ApiClient>(
      (client) => client.getGoalDetails(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
