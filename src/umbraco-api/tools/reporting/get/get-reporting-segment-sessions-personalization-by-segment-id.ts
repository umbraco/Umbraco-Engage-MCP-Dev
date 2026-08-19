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

const inputSchema = z.object({ segmentId: z.number() });
const outputSchema = getReportingSegmentSessionsPersonalizationBySegmentIdResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting-segment-sessions-personalization-by-segment-id",
  description:
    "Get the Umbraco Engage Reporting Segment Sessions Personalization By Segment Id resource. Calls GET /umbraco/engage/management/api/v1/reporting/segment/sessions/personalization/{segmentId}.",
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
