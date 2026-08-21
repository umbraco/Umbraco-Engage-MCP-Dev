import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postProfileOverviewBody, postProfileOverviewResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postProfileOverviewBody>;

// `skip`/`take` default sensibly instead of being required with no
// guidance - withStandardDecorators also auto-converts them to cursor-based
// pagination (stripping skip/take from the exposed schema in favor of a
// `cursor` param), using `take`'s default as the page size.
// `activeRange.from`/`activeRange.to` are flattened to top-level
// `activeFrom`/`activeTo` rather than a nested object.
const inputSchema = z.object({
  skip: postProfileOverviewBody.shape.skip.default(0),
  take: postProfileOverviewBody.shape.take.default(25),
  order: postProfileOverviewBody.shape.order,
  ascending: postProfileOverviewBody.shape.ascending,
  segmentId: postProfileOverviewBody.shape.segmentId.describe("A segment's `unique` guid (from get-segments-all)."),
  minimumGoalValue: postProfileOverviewBody.shape.minimumGoalValue,
  minimumCompletedGoals: postProfileOverviewBody.shape.minimumCompletedGoals,
  isUnidentified: postProfileOverviewBody.shape.isUnidentified,
  isIdentified: postProfileOverviewBody.shape.isIdentified,
  isHighPotential: postProfileOverviewBody.shape.isHighPotential,
  activeFrom: z.iso.datetime().nullish(),
  activeTo: z.iso.datetime().nullish(),
  identifiedName: postProfileOverviewBody.shape.identifiedName,
});
const outputSchema = postProfileOverviewResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-profile-overview",
  description:
    "Search visitor profiles with filters (segment, goal thresholds, identification status, active date range), paginated via `cursor` (pass the previous response's `nextCursor` for the next page; omit for the first page). Despite the POST verb, this is read-only. See post-profile-export-csv for a CSV export of the same search.",
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
    return executeGetApiCall<ReturnType<ApiClient["postProfileOverview"]>, ApiClient>(
      (client) => client.postProfileOverview(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
