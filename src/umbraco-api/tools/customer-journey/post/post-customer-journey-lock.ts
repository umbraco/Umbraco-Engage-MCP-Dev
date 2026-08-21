import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postCustomerJourneyLockBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postCustomerJourneyLockBody;

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-customer-journey-lock",
  description:
    "Lock a visitor's customer-journey-step score assignment (`entityId` is the journey step's id, `visitorId` the visitor's profile id), pinning it so automatic scoring no longer updates it. Requires a real visitor with existing tracking history - a non-existent visitor/entity pair errors.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postCustomerJourneyLock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
