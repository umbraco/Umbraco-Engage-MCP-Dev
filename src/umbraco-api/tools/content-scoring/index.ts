import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-content-scoring-all.js";
import tool1 from "./get/get-content-scoring-export-customer-journey.js";
import tool2 from "./get/get-content-scoring-export-persona.js";
import tool3 from "./delete/delete-content-scoring-journey.js";
import tool4 from "./delete/delete-content-scoring-persona.js";
import tool5 from "./post/post-content-scoring-save.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "content-scoring",
    displayName: "Content Scoring",
    description: "Umbraco Engage Content Scoring tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5],
};

export default collection;
