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
    "Get the Umbraco Engage Referral Group Visitors resource. Calls GET /umbraco/engage/management/api/v1/referral-group/visitors.",
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
