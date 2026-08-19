import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./post/post-referral-scoring-scored.js";
import tool1 from "./post/post-referral-scoring-unscored.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "referral-scoring",
    displayName: "Referral Scoring",
    description: "Umbraco Engage Referral Scoring tools",
  },
  tools: () => [tool0, tool1],
};

export default collection;
