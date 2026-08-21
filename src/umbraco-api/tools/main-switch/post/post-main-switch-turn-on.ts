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
    "Turn on Umbraco Engage tracking site-wide - enables analytics, A/B testing, and personalization data collection for all visitors.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postMainSwitchTurnOn(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
