import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getCustomerJourneyDetailsQueryParams, getCustomerJourneyDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getCustomerJourneyDetailsQueryParams;
const outputSchema = getCustomerJourneyDetailsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-customer-journey-details",
  description:
    "Get the Umbraco Engage Customer Journey Details resource. Calls GET /umbraco/engage/management/api/v1/customer-journey/details.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getCustomerJourneyDetails"]>, ApiClient>(
      (client) => client.getCustomerJourneyDetails(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
