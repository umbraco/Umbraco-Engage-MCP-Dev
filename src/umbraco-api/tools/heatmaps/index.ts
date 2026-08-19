import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-heatmaps-generate-scroll-heatmap.js";
import tool1 from "./get/get-heatmaps-variants.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "heatmaps",
    displayName: "Heatmaps",
    description: "Umbraco Engage Heatmaps tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
