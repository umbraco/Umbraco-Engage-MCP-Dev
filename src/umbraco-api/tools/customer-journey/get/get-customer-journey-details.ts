import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getCustomerJourneyDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a lookup with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.uuid() });
const outputSchema = getCustomerJourneyDetailsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-customer-journey-details",
  description:
    "Get a single customer journey and its full steps array by its `id` - the journey's `unique` guid (from get-customer-journey-all or a post-customer-journey response), not any other identifier.",
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
