import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postTrafficFilterBody, postTrafficFilterResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postTrafficFilterBody>;

// `id`/`created`/`key` are mechanical - synthesized here rather than
// invented by the caller. `createdByUmbracoUserName` is ignored by the
// server regardless of what's sent (it always reflects whichever account
// is calling the API) - dropped from the input schema entirely.
const inputSchema = z.object({
  name: postTrafficFilterBody.shape.name,
  description: postTrafficFilterBody.shape.description,
  type: postTrafficFilterBody.shape.type.describe("e.g. 'UserAgent' - the category of request attribute this filter inspects."),
  mode: postTrafficFilterBody.shape.mode,
  condition: postTrafficFilterBody.shape.condition.describe("e.g. 'Contains' - how `value`/`values` are matched against the request attribute."),
  value: postTrafficFilterBody.shape.value,
  values: postTrafficFilterBody.shape.values.default([]),
  isActive: postTrafficFilterBody.shape.isActive.default(true),
});
const outputSchema = z.object({ key: postTrafficFilterResponse });

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-traffic-filter",
  description:
    "Create a new traffic filter rule (blocks or filters incoming traffic matching a condition, e.g. a user-agent pattern). Returns the created filter's `key` guid.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      created: new Date().toISOString(),
      key: randomUUID(),
      createdByUmbracoUserName: null,
      name: params.name,
      description: params.description,
      type: params.type,
      mode: params.mode,
      condition: params.condition,
      value: params.value ?? null,
      values: params.values,
      isActive: params.isActive,
    };
    const result = await executeGetApiCall<ReturnType<ApiClient["postTrafficFilter"]>, ApiClient>(
      (client) => client.postTrafficFilter(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
    // MCP structuredContent must be a JSON object — wrap the bare uuid.
    if (!result.isError && typeof result.structuredContent === "string") {
      return { ...result, structuredContent: { key: result.structuredContent } };
    }
    return result;
  },
};

export default withStandardDecorators(tool);
