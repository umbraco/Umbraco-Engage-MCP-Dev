import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-applied-personalization.js";
import tool1 from "./post/post-applied-personalization.js";
import tool2 from "./get/get-applied-personalization-all.js";
import tool3 from "./get/get-applied-personalization-id.js";
import tool4 from "./post/post-applied-personalization-segment.js";
import tool5 from "./get/get-applied-personalization-segment.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "applied-personalization",
    displayName: "Applied Personalization",
    description: "Umbraco Engage Applied Personalization tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5],
};

export default collection;
