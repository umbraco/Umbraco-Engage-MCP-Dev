import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-data-cleanup-last-run.js";
import tool1 from "./get/get-data-cleanup-logs.js";
import tool2 from "./get/get-data-cleanup-runs.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-cleanup",
    displayName: "Data Cleanup",
    description: "Umbraco Engage Data Cleanup tools",
  },
  tools: () => [tool0, tool1, tool2],
};

export default collection;
