import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-analytics-distinct.js";
import tool1 from "./post/post-analytics-query.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "analytics",
    displayName: "Analytics",
    description: "Umbraco Engage Analytics tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
