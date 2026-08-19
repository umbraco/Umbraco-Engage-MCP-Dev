import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postSegmentsUpdatePriorityBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({ items: postSegmentsUpdatePriorityBody });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-segments-update-priority",
  description:
    "Post the Umbraco Engage Segments Update Priority resource. Calls POST /umbraco/engage/management/api/v1/segments/update-priority.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postSegmentsUpdatePriority(params.items, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
