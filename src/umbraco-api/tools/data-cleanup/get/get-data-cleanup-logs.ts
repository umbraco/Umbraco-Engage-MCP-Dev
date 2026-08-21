import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getDataCleanupLogsQueryParams, getDataCleanupLogsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getDataCleanupLogsQueryParams;
const outputSchema = getDataCleanupLogsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-data-cleanup-logs",
  description:
    "List flat, per-table Engage data-cleanup log entries (one row per table per run) - finer-grained than get-data-cleanup-runs' per-run breakdown. Supports `skip`/`take` pagination; use the response's `total` to know when to stop paging.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataCleanupLogs"]>, ApiClient>(
      (client) => client.getDataCleanupLogs(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
