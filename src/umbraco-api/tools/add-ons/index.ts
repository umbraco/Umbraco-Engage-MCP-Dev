import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-add-ons.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "add-ons",
    displayName: "Add Ons",
    description: "Umbraco Engage Add Ons tools",
  },
  tools: () => [tool0],
};

export default collection;
