import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-traffic-filter.js";
import tool1 from "./get/get-traffic-filter.js";
import tool2 from "./post/post-traffic-filter.js";
import tool3 from "./get/get-traffic-filter-all.js";
import tool4 from "./get/get-traffic-filter-empty.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "traffic-filter",
    displayName: "Traffic Filter",
    description: "Umbraco Engage Traffic Filter tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4],
};

export default collection;
