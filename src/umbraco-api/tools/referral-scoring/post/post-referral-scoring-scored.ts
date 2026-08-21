import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postReferralScoringScoredBody, postReferralScoringScoredResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postReferralScoringScoredBody.extend({
  page: postReferralScoringScoredBody.shape.page.int().min(1).default(1),
  pageSize: postReferralScoringScoredBody.shape.pageSize.int().min(1).max(200).default(25),
  amountOfDays: postReferralScoringScoredBody.shape.amountOfDays.default(30),
});
const outputSchema = postReferralScoringScoredResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-referral-scoring-scored",
  description:
    "List referral URLs that have been assigned a referral score, paginated, over the last `amountOfDays` days. Despite the POST verb, this is read-only. Use `currentPage`/`totalPages`/`totalRowCount` to know when to stop paging. See post-referral-scoring-unscored for referral URLs not yet scored.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postReferralScoringScored"]>, ApiClient>(
      (client) => client.postReferralScoringScored(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
