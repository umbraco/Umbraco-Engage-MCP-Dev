import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-cockpit-auth-domains.js";
import tool1 from "./post/post-cockpit-auth-generate-token.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "cockpit-auth",
    displayName: "Cockpit Auth",
    description: "Umbraco Engage Cockpit Auth tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
