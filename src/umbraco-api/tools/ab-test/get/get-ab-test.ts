import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but the real API always returns
// 400 Bad Request when it's omitted (confirmed empirically) - required here
// so callers get a clear schema-validation error instead of an opaque 400.
const inputSchema = z.object({ id: z.number() });
const outputSchema = getAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test",
  description:
    "Get a single A/B test by its numeric id. Returns the same underlying test entity as get-ab-test-view-model, which instead takes the test's `unique` guid - use this tool when you already have the numeric id (e.g. from get-ab-test-all), use get-ab-test-view-model when you only have the `unique` (e.g. from post-ab-test's response). Returns 404 if no test has that id.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTest"]>, ApiClient>(
      (client) => client.getAbTest(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
