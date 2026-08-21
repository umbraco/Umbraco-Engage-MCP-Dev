import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestVariantDisableResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `variantId` optional, but a disable with no
// target is meaningless - required here so callers get a clear schema
// error instead.
const inputSchema = z.object({ variantId: z.number() });
const outputSchema = postAbTestVariantDisableResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-variant-disable",
  description:
    "Disable an existing A/B test variant by its numeric `variantId`, stopping it from being served to visitors. This modifies an existing variant - it does not create one.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["update"],
  annotations: { destructiveHint: false, idempotentHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postAbTestVariantDisable"]>, ApiClient>(
      (client) => client.postAbTestVariantDisable(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
