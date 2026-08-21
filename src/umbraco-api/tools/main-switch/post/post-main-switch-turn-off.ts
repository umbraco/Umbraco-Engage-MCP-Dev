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
  name: "post-main-switch-turn-off",
  description:
    "Turn off Umbraco Engage tracking site-wide - disables analytics, A/B testing, and personalization data collection for all visitors until turned back on. This stops data capture for the whole site, not just one feature.",
  inputSchema: inputSchema.shape,
  slices: ["update"],
  annotations: { destructiveHint: true, idempotentHint: true },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postMainSwitchTurnOff(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
