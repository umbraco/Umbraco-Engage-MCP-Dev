import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-goal.js";
import tool1 from "./post/post-goal-all.js";
import tool2 from "./get/get-goal-all-types.js";
import tool3 from "./get/get-goal-details.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "goal",
    displayName: "Goal",
    description: "Umbraco Engage Goal tools",
  },
  tools: () => [tool0, tool1, tool2, tool3],
};

export default collection;
