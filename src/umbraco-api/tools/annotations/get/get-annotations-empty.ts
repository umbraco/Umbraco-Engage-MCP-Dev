import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAnnotationsEmptyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = getAnnotationsEmptyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-annotations-empty",
  description:
    "Get the Umbraco Engage Annotations Empty resource. Calls GET /umbraco/engage/management/api/v1/annotations/empty.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getAnnotationsEmpty"]>, ApiClient>(
      (client) => client.getAnnotationsEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
