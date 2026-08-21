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
    "Start an asynchronous reporting-table generation job. Call get-reporting-generation-status afterward to check progress (`isGenerating`) and completion (`reportingTablesExist`, `lastGenerated`).",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async () => {
    const result = await executeVoidApiCall<ApiClient>(
      (client) => client.postReportingGenerationStart(CAPTURE_RAW_HTTP_RESPONSE),
    );
    if (!result.isError) {
      return {
        ...result,
        content: [{ type: "text" as const, text: "Reporting generation started." }],
      };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
