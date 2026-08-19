import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-referral-group.js";
import tool1 from "./get/get-referral-group.js";
import tool2 from "./post/post-referral-group.js";
import tool3 from "./get/get-referral-group-all.js";
import tool4 from "./get/get-referral-group-visitors.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "referral-group",
    displayName: "Referral Group",
    description: "Umbraco Engage Referral Group tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4],
};

export default collection;
