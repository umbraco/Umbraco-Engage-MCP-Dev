import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getReportingSegmentSessionsPersonalizationBySegmentIdResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({
  segmentId: z.number().describe("The segment's numeric id (from get-segments-all), not its unique guid."),
});
const outputSchema = getReportingSegmentSessionsPersonalizationBySegmentIdResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting-segment-sessions-personalization-by-segment-id",
  description:
    "Get session-count buckets (`one`/`two`/`three`/`four`/`moreThanFour` sessions) for a segment's 'personalization' view - i.e. how many visitors had exactly that many sessions. See get-reporting-segment-sessions-potential-by-segment-id for the 'potential' view over the same segment; the precise distinction between the two is not documented upstream.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getReportingSegmentSessionsPersonalizationBySegmentId"]>, ApiClient>(
      (client) => client.getReportingSegmentSessionsPersonalizationBySegmentId(params.segmentId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
