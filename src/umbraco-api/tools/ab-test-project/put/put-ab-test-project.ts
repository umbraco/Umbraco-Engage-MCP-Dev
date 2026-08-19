import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { putAbTestProjectBody, putAbTestProjectResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = putAbTestProjectBody;
const outputSchema = putAbTestProjectResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "put-ab-test-project",
  description:
    "Update the Umbraco Engage Ab Test Project resource. Calls PUT /umbraco/engage/management/api/v1/ab-test-project.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["update"],
  annotations: { idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["putAbTestProject"]>, ApiClient>(
      (client) => client.putAbTestProject(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
