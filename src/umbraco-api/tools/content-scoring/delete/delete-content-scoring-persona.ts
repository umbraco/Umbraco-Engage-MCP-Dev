import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

// The generated schema marks `id` optional, but omitting it returns a
// silent, ambiguous success with no indication of what (if anything) was
// deleted (confirmed empirically) - required here so a caller can't
// accidentally trigger that.
const inputSchema = z.object({ id: z.number() });

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "delete-content-scoring-persona",
  description:
    "Delete a Persona-type content-scoring row by its own `id` (from get-content-scoring-all) - not the document's `documentUnique` or the persona-segment's `entityId`. Use delete-content-scoring-journey instead for Journey-type rows. Deleting a non-existent id succeeds without error.",
  inputSchema: inputSchema.shape,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteContentScoringPersona(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
