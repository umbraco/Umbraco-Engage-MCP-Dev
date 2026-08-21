import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postCustomerJourneyUnlockBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postCustomerJourneyUnlockBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-customer-journey-unlock",
  description:
    "Unlock a visitor's customer-journey-step score assignment previously locked via post-customer-journey-lock (`entityId` is the journey step's id, `visitorId` the visitor's profile id), letting automatic scoring resume updating it.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postCustomerJourneyUnlock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
