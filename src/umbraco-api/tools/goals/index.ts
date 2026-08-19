import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-goals-all.js";
import tool1 from "./get/get-goals-main.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "goals",
    displayName: "Goals",
    description: "Umbraco Engage Goals tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
