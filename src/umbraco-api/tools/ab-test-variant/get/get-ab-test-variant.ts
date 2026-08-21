import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getAbTestVariantResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but a lookup with no target is
// meaningless - required here so callers get a clear schema error instead.
const inputSchema = z.object({ id: z.number() });
const outputSchema = getAbTestVariantResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-variant",
  description:
    "Get a single A/B test variant (one treatment/control arm of an A/B test) by its numeric `id` - the same `id` used by delete-ab-test-variant and post-ab-test-variant-disable. Call this before post-ab-test-variant to fetch current field values, since that tool requires a full replace, not a partial patch.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestVariant"]>, ApiClient>(
      (client) => client.getAbTestVariant(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
