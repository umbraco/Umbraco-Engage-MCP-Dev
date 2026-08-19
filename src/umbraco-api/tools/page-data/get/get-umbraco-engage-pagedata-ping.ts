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
  name: "get-umbraco-engage-pagedata-ping",
  description:
    "Get the Umbraco Engage Umbraco Engage Pagedata Ping resource. Calls GET /umbraco/engage/pagedata/ping.",
  inputSchema: inputSchema.shape,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.getUmbracoEngagePagedataPing(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
