import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getGoalsAllResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = z.object({ items: getGoalsAllResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-goals-all",
  description:
    "List the Umbraco Engage Goals All resource. Calls GET /umbraco/engage/management/api/v1/goals/all.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getGoalsAll"]>, ApiClient>(
      (client) => client.getGoalsAll(CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
