import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-customer-journey.js";
import tool1 from "./post/post-customer-journey.js";
import tool2 from "./get/get-customer-journey-all.js";
import tool3 from "./get/get-customer-journey-details.js";
import tool4 from "./get/get-customer-journey-empty.js";
import tool5 from "./post/post-customer-journey-lock.js";
import tool6 from "./post/post-customer-journey-unlock.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "customer-journey",
    displayName: "Customer Journey",
    description: "Umbraco Engage Customer Journey tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5, tool6],
};

export default collection;
