import { randomUUID } from "node:crypto";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postAbTestProjectBody, postAbTestProjectResponse } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;
type FullBody = z.infer<typeof postAbTestProjectBody>;

// A project starts empty - `amountOfTests`/`amountOfActiveTests`/`abTests`
// have no meaningful non-empty value on creation, and `id`/`unique`/
// `created` are mechanical identifiers the caller has no reason to invent.
// A/B tests are added to the project afterwards via the ab-test collection's
// own tools (using this project's `unique` as their `projectId`).
const inputSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
});
const outputSchema = postAbTestProjectResponse;

const tool: ToolDefinition<typeof inputSchema.shape, typeof outputSchema> = {
  name: "post-ab-test-project",
  description:
    "Create a new, empty A/B test project (a named container that A/B tests can be grouped under). Individual A/B tests are added afterwards via the ab-test collection's own tools, not through this one.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    const body: FullBody = {
      id: 0,
      created: new Date().toISOString(),
      unique: randomUUID(),
      name: params.name ?? null,
      description: params.description ?? null,
      createdByUmbracoUserName: null,
      amountOfTests: 0,
      amountOfActiveTests: 0,
      invalid: false,
      archived: false,
      abTests: [],
    };
    return executeGetApiCall<ReturnType<ApiClient["postAbTestProject"]>, ApiClient>(
      (client) => client.postAbTestProject(body, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
