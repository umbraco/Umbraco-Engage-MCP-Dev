import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteCustomerJourneyQueryParams, deleteCustomerJourneyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deleteCustomerJourneyQueryParams;
const outputSchema = deleteCustomerJourneyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-customer-journey",
  description:
    "Delete the Umbraco Engage Customer Journey resource. Calls DELETE /umbraco/engage/management/api/v1/customer-journey.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["deleteCustomerJourney"]>, ApiClient>(
      (client) => client.deleteCustomerJourney(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
