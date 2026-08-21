import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAnnotationsBody, postAnnotationsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAnnotationsBody>;

// `id`/`created` are mechanical - the server assigns the real id and the
// caller has no reason to invent an audit-creation timestamp. `timestamp`
// (the point on the analytics timeline this annotation marks) is kept as a
// real, caller-meaningful input since it can legitimately differ from
// "now" (e.g. backdating a note about a past deploy), defaulting to now.
const inputSchema = z.object({
  timestamp: z.iso.datetime().optional().describe("Defaults to now. The point on the analytics timeline this annotation marks - not necessarily when the annotation record itself was created."),
  description: z.string(),
  createdByUserName: z.string().describe("The acting user/system this annotation should be attributed to - not auto-populated or validated by the server."),
  visibility: postAnnotationsBody.shape.visibility,
  invalid: z.boolean().default(false),
  pageVariants: z
    .array(z.object({ unique: z.uuid(), culture: z.string().nullish() }))
    .default([])
    .describe("Ties the annotation to specific content nodes - `unique` is the content item's guid (from a content lookup tool), `culture` is optional for variant content. Leave empty for a site-wide annotation."),
});
const outputSchema = postAnnotationsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-annotations",
  description:
    "Create a new analytics annotation (a timeline marker/event note, e.g. a deploy or campaign note, attached to analytics data).",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      created: new Date().toISOString(),
      timestamp: params.timestamp ?? new Date().toISOString(),
      description: params.description,
      createdByUserName: params.createdByUserName,
      visibility: params.visibility,
      invalid: params.invalid,
      pageVariants: params.pageVariants,
    };
    return executeGetApiCall<ReturnType<ApiClient["postAnnotations"]>, ApiClient>(
      (client) => client.postAnnotations(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
