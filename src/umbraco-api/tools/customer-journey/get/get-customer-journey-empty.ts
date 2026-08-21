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
    "Get a blank customer journey template with default field values (no steps, minimumDeviationType 'Absolute', expirationType 'never'). Useful for inspecting the shape/defaults post-customer-journey expects - not required to create a journey, since post-customer-journey applies the same defaults internally when fields are omitted.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["other"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getCustomerJourneyEmpty"]>, ApiClient>(
      (client) => client.getCustomerJourneyEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
