import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postPermissionsUserGroupBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postPermissionsUserGroupBody>;

// `id`/`unique`/`updated`/`updatedByUmbracoUserKey` are mechanical - the
// server never treats this as an update (see the CRITICAL warning in the
// description below), so there is no real state to preserve and these are
// safe to always synthesize fresh.
const inputSchema = z.object({
  userGroupKey: postPermissionsUserGroupBody.shape.userGroupKey,
  userGroupName: z.string().nullish(),
  userGroupAlias: z.string().nullish(),
  userGroupIconUrl: z.string().nullish(),
  accessToAnalytics: z.boolean().default(false),
  accessToAbTesting: z.boolean().default(false),
  accessToPersonalization: z.boolean().default(false),
  accessToSettings: z.boolean().default(false),
  accessToProfiles: z.boolean().default(false),
  accessToReporting: z.boolean().default(false),
  updatedByUmbracoUser: z.string().nullish(),
});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-permissions-user-group",
  description:
    "Create an Engage permissions entry for an Umbraco user group. CRITICAL: this endpoint is insert-only, never an upsert - calling it again for a `userGroupKey` that already has a stored entry creates a SECOND row for that key, which permanently crashes get-permissions-user-group-all (500 error) for every caller, with no delete endpoint to recover. Always call get-permissions-user-group first to check whether the user group already has an entry before calling this.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: true, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      unique: randomUUID(),
      userGroupKey: params.userGroupKey,
      userGroupName: params.userGroupName ?? null,
      userGroupAlias: params.userGroupAlias ?? null,
      userGroupIconUrl: params.userGroupIconUrl ?? null,
      accessToAnalytics: params.accessToAnalytics,
      accessToAbTesting: params.accessToAbTesting,
      accessToPersonalization: params.accessToPersonalization,
      accessToSettings: params.accessToSettings,
      accessToProfiles: params.accessToProfiles,
      accessToReporting: params.accessToReporting,
      updated: new Date().toISOString(),
      updatedByUmbracoUserKey: randomUUID(),
      updatedByUmbracoUser: params.updatedByUmbracoUser ?? null,
    };
    return executeVoidApiCall<ApiClient>(
      (client) => client.postPermissionsUserGroup(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
