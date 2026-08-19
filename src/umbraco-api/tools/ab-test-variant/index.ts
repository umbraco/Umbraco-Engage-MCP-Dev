import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-ab-test-variant.js";
import tool1 from "./get/get-ab-test-variant.js";
import tool2 from "./post/post-ab-test-variant.js";
import tool3 from "./get/get-ab-test-variant-all.js";
import tool4 from "./post/post-ab-test-variant-create.js";
import tool5 from "./post/post-ab-test-variant-disable.js";
import tool6 from "./get/get-ab-test-variant-segment.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "ab-test-variant",
    displayName: "Ab Test Variant",
    description: "Umbraco Engage Ab Test Variant tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5, tool6],
};

export default collection;
