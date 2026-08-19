import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postUmbracoEngagePagedataCollectEventBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postUmbracoEngagePagedataCollectEventBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-umbraco-engage-pagedata-collect-event",
  description:
    "Post the Umbraco Engage Umbraco Engage Pagedata Collect Event resource. Calls POST /umbraco/engage/pagedata/collect-event.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postUmbracoEngagePagedataCollectEvent(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
