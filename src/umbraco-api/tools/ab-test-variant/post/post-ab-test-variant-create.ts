import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestVariantCreateResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `testId` optional, but a create with no
// parent test is meaningless - required here so callers get a clear
// schema error instead.
const inputSchema = z.object({ testId: z.number() });
const outputSchema = postAbTestVariantCreateResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-variant-create",
  description:
    "Add a new, blank variant to an existing A/B test (by its numeric `testId`) - the server generates the variant's id/unique/name and other fields. Use post-ab-test-variant afterwards to set its name/content; use this tool, not post-ab-test-variant, to actually create a new variant. A non-existent `testId` fails as a raw foreign-key-violation error, not a clean validation message.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestVariantCreate"]>, ApiClient>(
      (client) => client.postAbTestVariantCreate(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
