import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAppliedPersonalizationIdQueryParams, getAppliedPersonalizationIdResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAppliedPersonalizationIdQueryParams;
const outputSchema = getAppliedPersonalizationIdResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-applied-personalization-id",
  description:
    "Get the Umbraco Engage Applied Personalization Id resource. Calls GET /umbraco/engage/management/api/v1/applied-personalization/id.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAppliedPersonalizationId"]>, ApiClient>(
      (client) => client.getAppliedPersonalizationId(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
