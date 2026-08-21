import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { postAbTestVariantBody, postAbTestVariantResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = postAbTestVariantBody;
const outputSchema = postAbTestVariantResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-variant",
  description:
    "Update an existing A/B test variant's fields (name, description, css, javascript, redirectNodeKey, etc.). This does NOT create a new variant - use post-ab-test-variant-create for that. This is a full replace, not a partial patch: call get-ab-test-variant first with the same `id` to fetch current values (including `totalPageviewsForVariant`/`totalVisitorsForVariant`, which will be reset if omitted/zeroed), then resupply all fields with only your intended changes modified. A non-existent `abTestId` fails as a raw foreign-key-violation error, not a clean validation message.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestVariant"]>, ApiClient>(
      (client) => client.postAbTestVariant(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
