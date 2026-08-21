import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { deleteAbTestResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `unique` optional, but omitting it does NOT
// error - confirmed empirically, the real API silently treats a missing
// `unique` as the all-zero guid and returns a normal, non-error
// `{ isValid: false, errors: [...] }` result for it. Required here so a
// caller can't accidentally "delete nothing" and get a confusing response.
const inputSchema = z.object({ unique: z.uuid() });
const outputSchema = deleteAbTestResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "delete-ab-test",
  description:
    "Delete an A/B test by its `unique` guid. Returns HTTP 200 with { isValid: false, errors: [...] } (not an error result) if no test has that unique - check `isValid` to confirm deletion succeeded.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["deleteAbTest"]>, ApiClient>(
      (client) => client.deleteAbTest(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
