import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-data-generation-logs.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-generation",
    displayName: "Data Generation",
    description: "Umbraco Engage Data Generation tools",
  },
  tools: () => [tool0],
};

export default collection;
