import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a delete with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.uuid() });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-applied-personalization",
  description:
    "Delete an applied personalization by its `id` - the entity's `unique` guid, not any numeric `id` field on the entity itself. This is a soft delete - the guid is never freed for reuse.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteAppliedPersonalization(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
