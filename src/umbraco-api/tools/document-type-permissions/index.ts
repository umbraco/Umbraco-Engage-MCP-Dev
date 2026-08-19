import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-permissions-document-type.js";
import tool1 from "./post/post-permissions-document-type.js";
import tool2 from "./get/get-permissions-document-type-all.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "document-type-permissions",
    displayName: "Document Type Permissions",
    description: "Umbraco Engage Document Type Permissions tools",
  },
  tools: () => [tool0, tool1, tool2],
};

export default collection;
