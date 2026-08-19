import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-annotations.js";
import tool1 from "./post/post-annotations.js";
import tool2 from "./get/get-annotations-all.js";
import tool3 from "./get/get-annotations-empty.js";
import tool4 from "./get/get-annotations-global.js";
import tool5 from "./get/get-annotations-page.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "annotations",
    displayName: "Annotations",
    description: "Umbraco Engage Annotations tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5],
};

export default collection;
