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
  name: "post-reporting-generation-start",
  description:
    "Post the Umbraco Engage Reporting Generation Start resource. Calls POST /umbraco/engage/management/api/v1/reporting/generation/start.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async () => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postReportingGenerationStart(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
