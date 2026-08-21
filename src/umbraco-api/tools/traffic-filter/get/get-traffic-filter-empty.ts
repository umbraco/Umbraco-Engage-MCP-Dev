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
    "Get a blank traffic filter template with default field values. Useful for inspecting the shape/defaults post-traffic-filter expects - not required to create a filter, since post-traffic-filter applies its own defaults internally when fields are omitted.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["other"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTrafficFilterEmpty"]>, ApiClient>(
      (client) => client.getTrafficFilterEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
