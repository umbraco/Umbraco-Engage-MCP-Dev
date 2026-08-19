import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-permissions-user-group.js";
import tool1 from "./post/post-permissions-user-group.js";
import tool2 from "./get/get-permissions-user-group-all.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "user-group-permissions",
    displayName: "User Group Permissions",
    description: "Umbraco Engage User Group Permissions tools",
  },
  tools: () => [tool0, tool1, tool2],
};

export default collection;
