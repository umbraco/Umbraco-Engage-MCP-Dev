import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-cultures.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "cultures",
    displayName: "Cultures",
    description: "Umbraco Engage Cultures tools",
  },
  tools: () => [tool0],
};

export default collection;
