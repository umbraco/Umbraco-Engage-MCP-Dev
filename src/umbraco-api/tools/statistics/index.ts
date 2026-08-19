import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-statistics.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "statistics",
    displayName: "Statistics",
    description: "Umbraco Engage Statistics tools",
  },
  tools: () => [tool0],
};

export default collection;
