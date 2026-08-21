import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { getPersonaEmptyResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({});
const outputSchema = getPersonaEmptyResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "get-persona-empty",
  description:
    "Get a blank persona group template with default field values (no personas, minimumParticipationScoreThreshold 25, minimumDeviationType 'Absolute', expirationType 'never', upperScoreLimit 10). Useful for inspecting the shape/defaults post-persona expects - not required to create a group, since post-persona applies the same defaults internally when fields are omitted.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["other"],
  annotations: { readOnlyHint: true },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getPersonaEmpty"]>, ApiClient>(
      (client) => client.getPersonaEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
