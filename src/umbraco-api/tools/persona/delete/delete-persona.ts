import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deletePersonaQueryParams, deletePersonaResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = deletePersonaQueryParams;
const outputSchema = deletePersonaResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-persona",
  description:
    "Delete the Umbraco Engage Persona resource. Calls DELETE /umbraco/engage/management/api/v1/persona.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["deletePersona"]>, ApiClient>(
      (client) => client.deletePersona(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
