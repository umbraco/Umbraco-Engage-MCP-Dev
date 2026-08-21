import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getAbTestEmptyQueryParams, getAbTestEmptyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = getAbTestEmptyQueryParams;
const outputSchema = getAbTestEmptyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-ab-test-empty",
  description:
    "Get a blank draft A/B test template for the given test type, with all fields at their real server-side defaults (participationPercentage: 1, minimumDetectableEffect: 0.1, two unnamed variant stubs, etc.) and no goal or content page assigned. Useful for inspecting the exact shape/defaults post-ab-test expects - not needed to actually create a test, since post-ab-test builds this shape internally from a minimal input.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getAbTestEmpty"]>, ApiClient>(
      (client) => client.getAbTestEmpty(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
