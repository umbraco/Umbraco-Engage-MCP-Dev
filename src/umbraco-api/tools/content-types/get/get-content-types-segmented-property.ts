import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getContentTypesSegmentedPropertyQueryParams, getContentTypesSegmentedPropertyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getContentTypesSegmentedPropertyQueryParams;
const outputSchema = getContentTypesSegmentedPropertyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-types-segmented-property",
  description:
    "Get the Umbraco Engage Content Types Segmented Property resource. Calls GET /umbraco/engage/management/api/v1/content-types/segmented-property.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getContentTypesSegmentedProperty"]>, ApiClient>(
      (client) => client.getContentTypesSegmentedProperty(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
