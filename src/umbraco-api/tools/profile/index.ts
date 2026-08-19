import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import tool0 from "./get/get-profile-bot-visitors.js";
import tool1 from "./get/get-profile-customer-journey-step-scores.js";
import tool2 from "./get/get-profile-details.js";
import tool3 from "./get/get-profile-export.js";
import tool4 from "./post/post-profile-export-csv.js";
import tool5 from "./get/get-profile-goal-completions.js";
import tool6 from "./get/get-profile-last-active-segment.js";
import tool7 from "./post/post-profile-overview.js";
import tool8 from "./get/get-profile-page-events.js";
import tool9 from "./get/get-profile-pageviews.js";
import tool10 from "./get/get-profile-persona-scores.js";
import tool11 from "./get/get-profile-potential.js";
import tool12 from "./get/get-profile-related.js";
import tool13 from "./get/get-profile-sessions.js";
import tool14 from "./get/get-profile-statistics-growth.js";
import tool15 from "./get/get-profile-statistics-identification.js";
import tool16 from "./get/get-profile-statistics-total.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "profile",
    displayName: "Profile",
    description: "Umbraco Engage Profile tools",
  },
  tools: () => [tool0, tool1, tool2, tool3, tool4, tool5, tool6, tool7, tool8, tool9, tool10, tool11, tool12, tool13, tool14, tool15, tool16],
};

export default collection;
