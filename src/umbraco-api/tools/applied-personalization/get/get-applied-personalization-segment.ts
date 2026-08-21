import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAppliedPersonalizationSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `segment` optional, but a lookup with no
// target segment is meaningless - required here so callers get a clear
// schema error instead.
const inputSchema = z.object({ segment: z.string() });
const outputSchema = getAppliedPersonalizationSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-applied-personalization-segment",
  description:
    "Get the applied personalization currently associated with a segment (a segment alias/name, not a guid). Returns a successful null result (not an error) if no personalization is applied to that segment - unlike get-applied-personalization-id, which errors for an unmatched id.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAppliedPersonalizationSegment"]>, ApiClient>(
      (client) => client.getAppliedPersonalizationSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
