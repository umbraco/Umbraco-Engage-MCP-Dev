import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-package.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "package",
    displayName: "Package",
    description: "Umbraco Engage Package tools",
  },
  tools: () => [tool0],
};

export default collection;
