import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-umbraco-engage-pagedata-collect.js";
import tool1 from "./post/post-umbraco-engage-pagedata-collect-event.js";
import tool2 from "./get/get-umbraco-engage-pagedata-ping.js";
import tool3 from "./post/post-umbraco-engage-pagedata-ping.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "page-data",
    displayName: "Page Data",
    description: "Umbraco Engage Page Data tools",
  },
  tools: () => [tool0, tool1, tool2, tool3],
};

export default collection;
