import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAbTestSegmentResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks every field optional, but the real handler
// (decompiled from Umbraco.Engage.Web.dll's CreateSegmentAbTestController)
// requires `unique` and `segment` unconditionally - required here so callers
// get a clear schema error instead of an opaque 400.
const inputSchema = z.object({
  unique: z
    .uuid()
    .describe(
      "The real, published content PAGE's unique guid (a Document id) that the visitor is on - NOT the A/B test's own `unique`. The server resolves this via IdKeyMap against Document entities.",
    ),
  culture: z.string().optional(),
  segment: z.string(),
});
const outputSchema = postAbTestSegmentResponse;

// TODO(umbraco-mcp-dev-cms#429): `create-document-type` hardcodes
// `variesBySegment: false` on the document type AND every property, with no
// schema field to override it - so a caller can never produce a
// segment-varying content type through that tool alone. The workaround this
// tool's description below tells callers to use (create, then a follow-up
// `update-document-type` call with `variesBySegment: true`) is CONFIRMED
// working end-to-end - see SegmentContentPageFixture in this collection's
// __tests__/helpers/, which uses exactly that workaround to build a real
// success-path test for this tool. Once umbraco-mcp-dev-cms#429 is fixed
// upstream (create-document-type exposes variesBySegment directly), simplify
// both this description and SegmentContentPageFixture to drop the
// follow-up update-document-type step.
// https://github.com/umbraco/Umbraco-CMS-MCP-Dev/issues/429
const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-segment",
  description:
    "Record which A/B test variant segment a visitor falls into, by writing an empty segment-varying property value onto the target content page. Requires `unique`'s content page to have a document type with segment variation enabled AND at least one property that varies by segment (check first via get-content-types-segmented-property) - otherwise the server returns a generic 400 Bad Request with no further detail (confirmed from the real Engage server source: CreateSegmentAbTestController -> UmbracoSegmentService.CreateSegment 400s whenever the resolved document's content type doesn't vary by segment, or has no segment-varying property). The A/B test's own Draft/Running status does NOT affect this endpoint (confirmed empirically). The chained CMS MCP's create-document-type tool can't set this itself (it hardcodes variesBySegment: false), but a follow-up update-document-type call with variesBySegment: true on the type and its property does work (confirmed empirically) - create the type, then update it before publishing a document to target.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestSegment"]>, ApiClient>(
      (client) => client.postAbTestSegment(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
