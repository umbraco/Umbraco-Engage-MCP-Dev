import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getContentScoringAllResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `unique` optional, but the real API always
// returns 400 when it's omitted, and also 400s for a well-formed but
// non-existent guid (confirmed empirically) - required here so callers
// get a clear schema error instead of an opaque 400.
const inputSchema = z.object({ unique: z.uuid() });
const outputSchema = getContentScoringAllResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-scoring-all",
  description:
    "List content-scoring rows (persona/customer-journey scores) for a specific document, identified by its `unique` id. Each row's `entityId` is a persona-segment or journey-step's own sub-entity id (from get-persona-details/customer-journey tools), not the persona/journey's own id. Use this to check current scores/lock state before saving new ones via post-content-scoring-save, or to find a row's `id` before deleting it.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getContentScoringAll"]>, ApiClient>(
      (client) => client.getContentScoringAll(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
