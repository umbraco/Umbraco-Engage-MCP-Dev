import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-reporting.js";
import tool1 from "./post/post-reporting-generation-start.js";
import tool2 from "./get/get-reporting-generation-status.js";
import tool3 from "./get/get-reporting-goal-personalization-performance-by-segment-id.js";
import tool4 from "./get/get-reporting-segment-sessions-personalization-by-segment-id.js";
import tool5 from "./get/get-reporting-segment-sessions-potential-by-segment-id.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "reporting",
    displayName: "Reporting",
    description: "Umbraco Engage Reporting tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5],
};

export default collection;
