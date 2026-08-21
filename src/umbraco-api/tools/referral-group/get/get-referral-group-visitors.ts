import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getReferralGroupVisitorsQueryParams, getReferralGroupVisitorsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getReferralGroupVisitorsQueryParams;
const outputSchema = getReferralGroupVisitorsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-referral-group-visitors",
  description:
    "Get visitor counts per referral group over the last `amountOfDays` days (default period if omitted is not documented upstream). Response is a string-keyed map to visitor counts - the exact key semantics (group name vs id) are unconfirmed.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getReferralGroupVisitors"]>, ApiClient>(
      (client) => client.getReferralGroupVisitors(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
