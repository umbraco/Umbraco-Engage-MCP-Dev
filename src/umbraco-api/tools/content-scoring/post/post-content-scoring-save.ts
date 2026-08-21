import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import { postContentScoringSaveBody } from "../../../api/generated/umbracoEngageManagementApi.zod.js";
import type { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoEngageManagementAPI>;

const inputSchema = z.object({
  items: postContentScoringSaveBody.element
    .extend({
      id: postContentScoringSaveBody.element.shape.id.describe(
        "0 to create a new row; an existing row's `id` (from get-content-scoring-all) to update it.",
      ),
      entityId: postContentScoringSaveBody.element.shape.entityId.describe(
        "For type 'Persona': the persona's SEGMENT sub-entity id (personas[N].id from get-persona-details) - NOT the persona's own id/unique. Using the wrong id can trigger a server-side error rather than a clean validation message. The equivalent caveat is expected, but unconfirmed, for type 'Journey'.",
      ),
      type: postContentScoringSaveBody.element.shape.type.describe(
        "'Persona' or 'Journey' selects which kind of entity `entityId` refers to. 'None' is a valid enum value but its meaning/use is undocumented upstream.",
      ),
    })
    .array(),
});

const tool: ToolDefinition<typeof inputSchema.shape> = {
  name: "post-content-scoring-save",
  description:
    "Save (create or update) one or more content-scoring rows, each linking a document (`documentUnique`) to a persona-segment or customer-journey-step (`entityId`, per `type`) with a numeric `score`. This call is void - it does not return the saved row(s)' real `id`; call get-content-scoring-all afterward and match on `entityId`/`documentUnique` to find it (e.g. before deleting it later). Use delete-content-scoring-persona/-journey (matching `type`) to remove a row.",
  inputSchema: inputSchema.shape,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postContentScoringSave(params.items, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(tool);
