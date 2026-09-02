import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./delete/delete-ab-test.js";
import tool1 from "./get/get-ab-test.js";
import tool2 from "./post/post-ab-test.js";
import tool3 from "./get/get-ab-test-all.js";
import tool4 from "./get/get-ab-test-empty.js";
import tool5 from "./get/get-ab-test-page.js";
import tool6 from "./get/get-ab-test-preview-url.js";
import tool7 from "./post/post-ab-test-runtime-indication.js";
import tool8 from "./post/post-ab-test-segment.js";
import tool9 from "./post/post-ab-test-variant-details.js";
import tool10 from "./get/get-ab-test-view-model.js";
import tool11 from "./post/post-ab-test-start.js";
import tool12 from "./post/post-ab-test-stop.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "ab-test",
    displayName: "Ab Test",
    description: "Umbraco Engage Ab Test tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5, tool6, tool7, tool8, tool9, tool10, tool11, tool12],
};

export default collection;
