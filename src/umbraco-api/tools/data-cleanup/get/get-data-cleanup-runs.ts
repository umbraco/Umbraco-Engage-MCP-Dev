import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getDataCleanupRunsQueryParams, getDataCleanupRunsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getDataCleanupRunsQueryParams;
const outputSchema = getDataCleanupRunsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-data-cleanup-runs",
  description:
    "List historical Engage data-cleanup runs, most recent first, each with a per-table `details` breakdown. Supports `skip`/`take` pagination; use the response's `total` to know when to stop paging. See get-data-cleanup-last-run for just the most recent run.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataCleanupRuns"]>, ApiClient>(
      (client) => client.getDataCleanupRuns(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
