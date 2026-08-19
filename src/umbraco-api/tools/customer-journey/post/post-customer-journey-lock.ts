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
    "Post the Umbraco Engage Customer Journey Lock resource. Calls POST /umbraco/engage/management/api/v1/customer-journey/lock.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postCustomerJourneyLock(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
