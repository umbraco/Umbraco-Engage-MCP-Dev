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
    "Update an existing A/B test project's fields. This is a full replace, not a partial patch - call get-ab-test-project first with the same `unique` to fetch current values for every field (amountOfTests, amountOfActiveTests, invalid, archived, abTests, etc.), then resupply all of them here with only your intended changes (e.g. `name`) modified. Omitting or zeroing a field you didn't intend to change will overwrite it on the server.",
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
