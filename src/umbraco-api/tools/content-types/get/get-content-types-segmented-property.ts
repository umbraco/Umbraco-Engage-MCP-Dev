import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getContentTypesSegmentedPropertyQueryParams, getContentTypesSegmentedPropertyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// Engage 18 returns SegmentedPropertyResponseModel (an object) here, so the
// response is passed through as-is; Engage 17 returned a bare boolean that
// had to be wrapped.
const inputSchema = getContentTypesSegmentedPropertyQueryParams;
const outputSchema = getContentTypesSegmentedPropertyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-types-segmented-property",
  description:
    "Check whether a document type (identified by its guid-shaped `unique`, not the numeric `id` from get-content-types-all) has a property configured for Engage content segmentation/personalization. Returns `{ hasSegmentedProperty: boolean, cultureSharedSegmentedProperties: string[] }` - the second lists segmented properties shared across cultures.",
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
