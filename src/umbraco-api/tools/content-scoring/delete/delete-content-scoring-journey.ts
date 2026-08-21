import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional. The sibling
// delete-content-scoring-persona tool was confirmed empirically to return
// a silent, ambiguous success when `id` is omitted - required here too on
// the assumption this shares the same underlying delete implementation.
const inputSchema = z.object({ id: z.number() });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-content-scoring-journey",
  description:
    "Delete a Journey-type content-scoring row by its own `id` (from get-content-scoring-all) - not the document's `documentUnique` or the journey-step's `entityId`. Use delete-content-scoring-persona instead for Persona-type rows. Deleting a non-existent id succeeds without error.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteContentScoringJourney(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
