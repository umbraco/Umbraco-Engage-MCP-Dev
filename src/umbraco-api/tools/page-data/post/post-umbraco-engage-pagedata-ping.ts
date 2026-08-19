import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-umbraco-engage-pagedata-ping",
  description:
    "Post the Umbraco Engage Umbraco Engage Pagedata Ping resource. Calls POST /umbraco/engage/pagedata/ping.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postUmbracoEngagePagedataPing(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
