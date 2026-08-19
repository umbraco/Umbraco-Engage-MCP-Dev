import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postReferralScoringUnscoredBody, postReferralScoringUnscoredResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postReferralScoringUnscoredBody;
const outputSchema = postReferralScoringUnscoredResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-referral-scoring-unscored",
  description:
    "Post the Umbraco Engage Referral Scoring Unscored resource. Calls POST /umbraco/engage/management/api/v1/referral-scoring/unscored.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postReferralScoringUnscored"]>, ApiClient>(
      (client) => client.postReferralScoringUnscored(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
