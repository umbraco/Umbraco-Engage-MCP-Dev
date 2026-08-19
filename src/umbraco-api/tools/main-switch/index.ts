import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-main-switch.js";
import tool1 from "./post/post-main-switch-turn-off.js";
import tool2 from "./post/post-main-switch-turn-on.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "main-switch",
    displayName: "Main Switch",
    description: "Umbraco Engage Main Switch tools",
  },
  tools: () => [tool0, tool1, tool2],
};

export default collection;
