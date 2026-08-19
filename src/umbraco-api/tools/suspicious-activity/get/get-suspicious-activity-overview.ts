import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getSuspiciousActivityOverviewQueryParams, getSuspiciousActivityOverviewResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getSuspiciousActivityOverviewQueryParams;
const outputSchema = getSuspiciousActivityOverviewResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-suspicious-activity-overview",
  description:
    "Get the Umbraco Engage Suspicious Activity Overview resource. Calls GET /umbraco/engage/management/api/v1/suspicious-activity/overview.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getSuspiciousActivityOverview"]>, ApiClient>(
      (client) => client.getSuspiciousActivityOverview(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
