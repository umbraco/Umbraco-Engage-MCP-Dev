import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postProfileExportCsvBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postProfileExportCsvBody>;

// `skip`/`take` default sensibly instead of being required with no
// guidance - withStandardDecorators also auto-converts them to cursor-based
// pagination (stripping skip/take from the exposed schema in favor of a
// `cursor` param), using `take`'s default as the page size.
// `activeRange.from`/`activeRange.to` are flattened to top-level
// `activeFrom`/`activeTo` rather than a nested object.
const inputSchema = z.object({
  skip: postProfileExportCsvBody.shape.skip.default(0),
  take: postProfileExportCsvBody.shape.take.default(25),
  order: postProfileExportCsvBody.shape.order,
  ascending: postProfileExportCsvBody.shape.ascending,
  segmentId: postProfileExportCsvBody.shape.segmentId.describe("A segment's `unique` guid (from get-segments-all)."),
  minimumGoalValue: postProfileExportCsvBody.shape.minimumGoalValue,
  minimumCompletedGoals: postProfileExportCsvBody.shape.minimumCompletedGoals,
  isUnidentified: postProfileExportCsvBody.shape.isUnidentified,
  isIdentified: postProfileExportCsvBody.shape.isIdentified,
  isHighPotential: postProfileExportCsvBody.shape.isHighPotential,
  activeFrom: z.iso.datetime().nullish(),
  activeTo: z.iso.datetime().nullish(),
  identifiedName: postProfileExportCsvBody.shape.identifiedName,
});
// The generated schema declares this as a File, but the real response is
// plain CSV text placed directly in structuredContent (confirmed
// empirically) - a bare string violates the MCP requirement that
// structuredContent be a JSON object, so it's wrapped as { csv: string }.
const outputSchema = z.object({ csv: z.string() });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-profile-export-csv",
  description:
    "Export visitor profiles matching the same filters as post-profile-overview (segment, goal thresholds, identification status, active date range) as CSV text, paginated via `cursor` (pass the previous response's `nextCursor` for the next page; omit for the first page). Use post-profile-overview instead for structured JSON results.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["search"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    const body: FullBody = {
      skip: params.skip,
      take: params.take,
      order: params.order,
      ascending: params.ascending,
      segmentId: params.segmentId,
      minimumGoalValue: params.minimumGoalValue,
      minimumCompletedGoals: params.minimumCompletedGoals,
      isUnidentified: params.isUnidentified,
      isIdentified: params.isIdentified,
      isHighPotential: params.isHighPotential,
      activeRange: (params.activeFrom || params.activeTo)
        ? { from: params.activeFrom ?? null, to: params.activeTo ?? null }
        : null,
      identifiedName: params.identifiedName,
    };
    const result = await executeGetApiCall<ReturnType<ApiClient["postProfileExportCsv"]>, ApiClient>(
      (client) => client.postProfileExportCsv(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap the raw CSV string.
    if (!result.isError && typeof result.structuredContent === "string") {
      return { ...result, structuredContent: { csv: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
