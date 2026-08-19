import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getProfileBotVisitorsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = getProfileBotVisitorsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-profile-bot-visitors",
  description:
    "Get the Umbraco Engage Profile Bot Visitors resource. Calls GET /umbraco/engage/management/api/v1/profile/bot-visitors.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getProfileBotVisitors"]>, ApiClient>(
      (client) => client.getProfileBotVisitors(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
