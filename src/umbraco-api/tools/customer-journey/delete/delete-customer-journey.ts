import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteCustomerJourneyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a delete with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.uuid() });
const outputSchema = deleteCustomerJourneyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-customer-journey",
  description:
    "Delete a customer journey by its `id` - the journey's `unique` guid, not any other identifier. Returns HTTP 200 with { isValid, warnings, errors } rather than an error result on failure - check `isValid` to confirm deletion succeeded.",
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
