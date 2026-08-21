import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAppliedPersonalizationBody, postAppliedPersonalizationResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAppliedPersonalizationBody>;

// `id`/`created`/`unique` (top-level and per-page/content-type) are
// mechanical join-row identifiers the server assigns - the caller supplies
// the real foreign keys (`nodeId`, `contentTypeId`) instead. The full
// nested `segment` DTO (with its own `rules[]`) is dropped in favor of
// `segmentId` (reference a segment created via the segments collection) or
// `umbracoSegmentAlias`, since embedding the whole segment definition here
// has no real decision content for a caller that already has a segment id.
const inputSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  type: postAppliedPersonalizationBody.shape.type,
  isActive: z.boolean().default(true),
  css: z.string().nullish(),
  javascript: z.string().nullish(),
  segmentId: z.number().nullish().describe("An existing segment's numeric id, if this personalization should target a segment."),
  umbracoSegmentAlias: z.string().nullish(),
  pages: z
    .array(z.object({ nodeId: z.number(), culture: z.string().nullish() }))
    .default([])
    .describe("Content pages (by numeric node id) this personalization targets - relevant when `type` is 'SinglePage'/'MultiPage'."),
  contentTypes: z
    .array(z.object({ contentTypeId: z.number(), culture: z.string().nullish() }))
    .default([])
    .describe("Content types this personalization targets - relevant when `type` is 'ContentType'."),
});
const outputSchema = postAppliedPersonalizationResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-applied-personalization",
  description:
    "Create a new applied personalization - a rule that shows different content/css/javascript to visitors matching a segment, on a set of pages or content types (per `type`).",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      created: new Date().toISOString(),
      unique: randomUUID(),
      segmentId: params.segmentId ?? null,
      segment: null,
      type: params.type,
      umbracoSegmentAlias: params.umbracoSegmentAlias ?? null,
      name: params.name ?? null,
      description: params.description ?? null,
      css: params.css ?? null,
      javascript: params.javascript ?? null,
      started: null,
      isActive: params.isActive,
      createdByUmbracoUserName: null,
      updatedByUmbracoUserName: null,
      pages: params.pages.map((page) => ({
        id: 0,
        unique: randomUUID(),
        nodeId: page.nodeId,
        culture: page.culture ?? null,
      })),
      contentTypes: params.contentTypes.map((contentType) => ({
        id: 0,
        key: randomUUID(),
        contentTypeId: contentType.contentTypeId,
        culture: contentType.culture ?? null,
      })),
      previewUrl: null,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAppliedPersonalization"]>, ApiClient>(
      (client) => client.postAppliedPersonalization(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
