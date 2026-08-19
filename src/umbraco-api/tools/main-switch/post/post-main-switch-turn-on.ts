import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-main-switch-turn-on",
  description:
    "Post the Umbraco Engage Main Switch Turn On resource. Calls POST /umbraco/engage/management/api/v1/main-switch/turn-on.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postMainSwitchTurnOn(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
