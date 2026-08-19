import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postReferralGroupBody, postReferralGroupResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postReferralGroupBody;
const outputSchema = postReferralGroupResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-referral-group",
  description:
    "Post the Umbraco Engage Referral Group resource. Calls POST /umbraco/engage/management/api/v1/referral-group.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postReferralGroup"]>, ApiClient>(
      (client) => client.postReferralGroup(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
