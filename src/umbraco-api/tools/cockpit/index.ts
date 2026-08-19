import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-cockpit-delete-cookie.js";
import tool1 from "./get/get-cockpit-get-umbraco-page-info.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "cockpit",
    displayName: "Cockpit",
    description: "Umbraco Engage Cockpit tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
