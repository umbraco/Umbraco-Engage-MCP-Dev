import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
// delete-segments-delete-segment-content (DELETE /segments/delete-segment-content)
// is not on this line: Engage 18 removed the endpoint.
import tool0 from "./delete/delete-segments.js";
import tool1 from "./get/get-segments.js";
import tool2 from "./post/post-segments.js";
import tool3 from "./get/get-segments-all.js";
import tool5 from "./get/get-segments-locations-data.js";
import tool6 from "./post/post-segments-update-priority.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "segments",
    displayName: "Segments",
    description: "Umbraco Engage Segments tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool5, tool6],
};

export default collection;
