import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getContentTypesSegmentedPropertyQueryParams, getContentTypesSegmentedPropertyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getContentTypesSegmentedPropertyQueryParams;
const outputSchema = z.object({ hasSegmentedProperty: getContentTypesSegmentedPropertyResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-content-types-segmented-property",
  description:
    "Check whether a document type (identified by its guid-shaped `unique`, not the numeric `id` from get-content-types-all) has a property configured for Engage content segmentation/personalization. Returns `{ hasSegmentedProperty: boolean }`.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getContentTypesSegmentedProperty"]>, ApiClient>(
      (client) => client.getContentTypesSegmentedProperty(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap the bare boolean.
    if (!result.isError && typeof result.structuredContent === "boolean") {
      return { ...result, structuredContent: { hasSegmentedProperty: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
