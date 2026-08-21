import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postPermissionsDocumentTypeBodyItem } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullItem = z.infer<typeof postPermissionsDocumentTypeBodyItem>;

// `id`/`updated`/`updatedByUmbracoUserKey` are mechanical - the server
// never treats this as an update (see the CRITICAL warning in the
// description below), so there is no real state to preserve and these are
// safe to always synthesize fresh.
const itemSchema = z.object({
  contentTypeId: postPermissionsDocumentTypeBodyItem.shape.contentTypeId,
  contentTypeName: z.string().nullish(),
  showAnalytics: z.boolean().default(true),
  allowAbTesting: z.boolean().default(true),
  allowScorePersonalization: z.boolean().default(true),
  allowApplyPersonalization: z.boolean().default(true),
  updatedByUmbracoUser: z.string().nullish(),
});
const inputSchema = z.object({ items: z.array(itemSchema) });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-permissions-document-type",
  description:
    "Create Engage permissions entries for one or more document types. CRITICAL: this endpoint is insert-only, never an upsert - calling it again for a `contentTypeId` that already has a stored entry creates a SECOND row for that id, which permanently crashes get-permissions-document-type-all for every caller, with no delete endpoint to recover. Always call get-permissions-document-type first for each contentTypeId to check whether a real entry already exists (a default response with id 0 means none exists yet) before calling this.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: true, idempotentHint: false },
  handler: async (params) => {
    const now = new Date().toISOString();
    const items: FullItem[] = params.items.map((item) => ({
      id: 0,
      contentTypeId: item.contentTypeId,
      contentTypeName: item.contentTypeName ?? null,
      showAnalytics: item.showAnalytics,
      allowAbTesting: item.allowAbTesting,
      allowScorePersonalization: item.allowScorePersonalization,
      allowApplyPersonalization: item.allowApplyPersonalization,
      updated: now,
      updatedByUmbracoUserKey: randomUUID(),
      updatedByUmbracoUser: item.updatedByUmbracoUser ?? null,
    }));
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPermissionsDocumentType(items, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
