import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getPersonaDetailsQueryParams, getPersonaDetailsResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getPersonaDetailsQueryParams;
const outputSchema = getPersonaDetailsResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-persona-details",
  description:
    "Get the Umbraco Engage Persona Details resource. Calls GET /umbraco/engage/management/api/v1/persona/details.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPersonaDetails"]>, ApiClient>(
      (client) => client.getPersonaDetails(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
