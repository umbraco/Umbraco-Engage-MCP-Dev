import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a delete with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.number() });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-annotations",
  description:
    "Delete an annotation by its numeric `id`. Idempotent - deleting a non-existent id succeeds silently rather than erroring.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteAnnotations(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
