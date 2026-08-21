import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postReferralScoringUnscoredBody, postReferralScoringUnscoredResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postReferralScoringUnscoredBody.extend({
  page: postReferralScoringUnscoredBody.shape.page.int().min(1).default(1),
  pageSize: postReferralScoringUnscoredBody.shape.pageSize.int().min(1).max(200).default(25),
  amountOfDays: postReferralScoringUnscoredBody.shape.amountOfDays.default(30),
});
const outputSchema = postReferralScoringUnscoredResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-referral-scoring-unscored",
  description:
    "List referral URLs seen in traffic that have NOT yet been assigned a referral score, paginated, over the last `amountOfDays` days. Despite the POST verb, this is read-only. Use `currentPage`/`totalPages`/`totalRowCount` to know when to stop paging. See post-referral-scoring-scored for already-scored referral URLs.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postReferralScoringUnscored"]>, ApiClient>(
      (client) => client.postReferralScoringUnscored(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
