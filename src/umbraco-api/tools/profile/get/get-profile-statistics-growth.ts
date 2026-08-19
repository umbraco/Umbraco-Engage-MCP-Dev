import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getProfileStatisticsGrowthQueryParams, getProfileStatisticsGrowthResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getProfileStatisticsGrowthQueryParams;
const outputSchema = getProfileStatisticsGrowthResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-statistics-growth",
  description:
    "Get the Umbraco Engage Profile Statistics Growth resource. Calls GET /umbraco/engage/management/api/v1/profile/statistics/growth.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getProfileStatisticsGrowth"]>, ApiClient>(
      (client) => client.getProfileStatisticsGrowth(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
