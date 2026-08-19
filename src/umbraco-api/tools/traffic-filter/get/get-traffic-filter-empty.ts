import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getTrafficFilterEmptyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = getTrafficFilterEmptyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-traffic-filter-empty",
  description:
    "Get the Umbraco Engage Traffic Filter Empty resource. Calls GET /umbraco/engage/management/api/v1/traffic-filter/empty.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTrafficFilterEmpty"]>, ApiClient>(
      (client) => client.getTrafficFilterEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
