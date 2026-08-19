import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-persona.js";
import tool1 from "./post/post-persona.js";
import tool2 from "./get/get-persona-all.js";
import tool3 from "./get/get-persona-details.js";
import tool4 from "./get/get-persona-empty.js";
import tool5 from "./post/post-persona-lock.js";
import tool6 from "./post/post-persona-unlock.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "persona",
    displayName: "Persona",
    description: "Umbraco Engage Persona tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5, tool6],
};

export default collection;
