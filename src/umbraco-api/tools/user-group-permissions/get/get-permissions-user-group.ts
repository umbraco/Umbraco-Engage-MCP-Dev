import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getPermissionsUserGroupResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `userGroupKey` optional, but a lookup with no
// key returns an error (a key with no stored row also errors, per this
// collection's own integration tests) - required here so callers get a
// clear schema error instead.
const inputSchema = z.object({ userGroupKey: z.uuid() });
const outputSchema = getPermissionsUserGroupResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-permissions-user-group",
  description:
    "Get the Engage access-permissions entry for a specific Umbraco user group by its `userGroupKey`. Errors if that user group has no stored entry - call this before post-permissions-user-group to check whether an entry already exists (that tool is insert-only and creating a duplicate permanently breaks get-permissions-user-group-all).",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPermissionsUserGroup"]>, ApiClient>(
      (client) => client.getPermissionsUserGroup(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
