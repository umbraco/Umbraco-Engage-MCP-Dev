import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getContentScoringAllQueryParams, getContentScoringAllResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getContentScoringAllQueryParams;
const outputSchema = getContentScoringAllResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-scoring-all",
  description:
    "List the Umbraco Engage Content Scoring All resource. Calls GET /umbraco/engage/management/api/v1/content-scoring/all.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["list"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getContentScoringAll"]>, ApiClient>(
      (client) => client.getContentScoringAll(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
