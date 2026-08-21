import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAbTestViewModelResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `unique` optional, but the real API always
// returns 404 Not Found when it's omitted (confirmed empirically) - required
// here so callers get a clear schema-validation error instead.
const inputSchema = z.object({ unique: z.uuid() });
const outputSchema = getAbTestViewModelResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-view-model",
  description:
    "Get a single A/B test by its `unique` guid. Returns the same underlying test entity as get-ab-test, which instead takes the test's numeric id - use this tool when you only have the `unique` (e.g. from post-ab-test's response), use get-ab-test when you already have the numeric id (e.g. from get-ab-test-all). Returns 404 if no test has that unique.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestViewModel"]>, ApiClient>(
      (client) => client.getAbTestViewModel(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
