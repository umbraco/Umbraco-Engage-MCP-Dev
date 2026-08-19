import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getCustomerJourneyEmptyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = getCustomerJourneyEmptyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-customer-journey-empty",
  description:
    "Get the Umbraco Engage Customer Journey Empty resource. Calls GET /umbraco/engage/management/api/v1/customer-journey/empty.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getCustomerJourneyEmpty"]>, ApiClient>(
      (client) => client.getCustomerJourneyEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
