import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-configuration.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "configuration",
    displayName: "Configuration",
    description: "Umbraco Engage Configuration tools",
  },
  tools: () => [tool0],
};

export default collection;
