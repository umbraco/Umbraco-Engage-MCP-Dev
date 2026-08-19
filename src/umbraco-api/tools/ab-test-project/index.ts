import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-ab-test-project.js";
import tool1 from "./delete/delete-ab-test-project.js";
import tool2 from "./get/get-ab-test-project.js";
import tool3 from "./put/put-ab-test-project.js";
import tool4 from "./get/get-ab-test-project-all.js";
import tool5 from "./get/get-ab-test-project-details.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "ab-test-project",
    displayName: "Ab Test Project",
    description: "Umbraco Engage Ab Test Project tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5],
};

export default collection;
