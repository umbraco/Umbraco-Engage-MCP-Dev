import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAppliedPersonalizationIdResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a lookup with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.uuid() });
const outputSchema = getAppliedPersonalizationIdResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-applied-personalization-id",
  description:
    "Get a single applied personalization by its `id`, which is the entity's `unique` guid (as returned by post-applied-personalization/get-applied-personalization-all) - not any numeric `id` field on the entity itself. Errors if no match is found (unlike get-applied-personalization-segment, which returns null instead).",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAppliedPersonalizationId"]>, ApiClient>(
      (client) => client.getAppliedPersonalizationId(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
