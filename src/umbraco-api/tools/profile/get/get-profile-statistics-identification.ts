import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getProfileStatisticsIdentificationQueryParams, getProfileStatisticsIdentificationResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getProfileStatisticsIdentificationQueryParams;
const outputSchema = getProfileStatisticsIdentificationResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-statistics-identification",
  description:
    "Get visitor identification counts over the last `numberOfDays` days (default 30): `newlyIdentified`, `formerlyUnknown`, and `unknown` visitor counts.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getProfileStatisticsIdentification"]>, ApiClient>(
      (client) => client.getProfileStatisticsIdentification(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
