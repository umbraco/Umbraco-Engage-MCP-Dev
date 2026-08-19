import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestVariantDetailsBody, postAbTestVariantDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAbTestVariantDetailsBody;
const outputSchema = z.object({ items: postAbTestVariantDetailsResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-variant-details",
  description:
    "Post the Umbraco Engage Ab Test Variant Details resource. Calls POST /umbraco/engage/management/api/v1/ab-test/variant-details.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["postAbTestVariantDetails"]>, ApiClient>(
      (client) => client.postAbTestVariantDetails(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap array responses.
    if (!result.isError && Array.isArray(result.structuredContent)) {
      return { ...result, structuredContent: { items: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
