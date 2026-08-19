import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-suspicious-activity-overview.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "suspicious-activity",
    displayName: "Suspicious Activity",
    description: "Umbraco Engage Suspicious Activity tools",
  },
  tools: () => [tool0],
};

export default collection;
