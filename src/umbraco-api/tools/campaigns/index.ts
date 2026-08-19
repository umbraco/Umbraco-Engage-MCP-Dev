import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-campaigns.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "campaigns",
    displayName: "Campaigns",
    description: "Umbraco Engage Campaigns tools",
  },
  tools: () => [tool0],
};

export default collection;
