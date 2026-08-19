import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getReportingSegmentSessionsPotentialBySegmentIdResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({ segmentId: z.number() });
const outputSchema = getReportingSegmentSessionsPotentialBySegmentIdResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-reporting-segment-sessions-potential-by-segment-id",
  description:
    "Get the Umbraco Engage Reporting Segment Sessions Potential By Segment Id resource. Calls GET /umbraco/engage/management/api/v1/reporting/segment/sessions/potential/{segmentId}.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getReportingSegmentSessionsPotentialBySegmentId"]>, ApiClient>(
      (client) => client.getReportingSegmentSessionsPotentialBySegmentId(params.segmentId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
