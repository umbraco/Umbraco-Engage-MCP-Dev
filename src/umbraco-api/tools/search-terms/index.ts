import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-search-terms.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "search-terms",
    displayName: "Search Terms",
    description: "Umbraco Engage Search Terms tools",
  },
  tools: () => [tool0],
};

export default collection;
