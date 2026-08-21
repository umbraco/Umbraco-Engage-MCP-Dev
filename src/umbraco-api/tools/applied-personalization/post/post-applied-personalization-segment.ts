import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAppliedPersonalizationSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// `unique` (the applied personalization's guid) and `segment` (the segment
// alias/name) are both required - this associates a specific, existing
// personalization with a specific, existing segment, so both identifiers
// are meaningful and neither has a sensible default.
const inputSchema = z.object({
  unique: z.uuid(),
  segment: z.string(),
  culture: z.string().optional(),
});
const outputSchema = postAppliedPersonalizationSegmentResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-applied-personalization-segment",
  description:
    "Associate an existing applied personalization (`unique`) with an Umbraco visitor segment (`segment`, an alias/name - not a guid) for an optional culture. Response is `{ created: boolean }` confirming whether the association was made.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAppliedPersonalizationSegment"]>, ApiClient>(
      (client) => client.postAppliedPersonalizationSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
