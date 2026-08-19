import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-content-types-all.js";
import tool1 from "./get/get-content-types-segmented-property.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "content-types",
    displayName: "Content Types",
    description: "Umbraco Engage Content Types tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
