/**
 * Tool Collections Export
 *
 * Lightweight entry point for in-process chaining.
 * Import this from another MCP server to chain tools without spawning a process.
 *
 * @example
 * ```typescript
 * import { collections, allModes, allModeNames, allSliceNames } from "@umbraco-engage/mcp-dev/collections";
 *
 * manager.registerServer({
 *   transport: "in-process",
 *   name: "my-addon",
 *   collections,
 *   modeRegistry: allModes,
 *   allModeNames,
 *   allSliceNames,
 * });
 * ```
 */

import packageCollection from "./umbraco-api/tools/package/index.js";
import abTestCollection from "./umbraco-api/tools/ab-test/index.js";
import abTestProjectCollection from "./umbraco-api/tools/ab-test-project/index.js";
import abTestVariantCollection from "./umbraco-api/tools/ab-test-variant/index.js";
import addOnsCollection from "./umbraco-api/tools/add-ons/index.js";
import analyticsCollection from "./umbraco-api/tools/analytics/index.js";
import annotationsCollection from "./umbraco-api/tools/annotations/index.js";
import appliedPersonalizationCollection from "./umbraco-api/tools/applied-personalization/index.js";
import campaignGroupCollection from "./umbraco-api/tools/campaign-group/index.js";
import campaignsCollection from "./umbraco-api/tools/campaigns/index.js";
import configurationCollection from "./umbraco-api/tools/configuration/index.js";
import contentScoringCollection from "./umbraco-api/tools/content-scoring/index.js";
import contentTypesCollection from "./umbraco-api/tools/content-types/index.js";
import culturesCollection from "./umbraco-api/tools/cultures/index.js";
import customerJourneyCollection from "./umbraco-api/tools/customer-journey/index.js";
import dataCleanupCollection from "./umbraco-api/tools/data-cleanup/index.js";
import documentTypePermissionsCollection from "./umbraco-api/tools/document-type-permissions/index.js";
import goalCollection from "./umbraco-api/tools/goal/index.js";
import goalsCollection from "./umbraco-api/tools/goals/index.js";
import heatmapsCollection from "./umbraco-api/tools/heatmaps/index.js";
import mainSwitchCollection from "./umbraco-api/tools/main-switch/index.js";
import personaCollection from "./umbraco-api/tools/persona/index.js";
import profileCollection from "./umbraco-api/tools/profile/index.js";
import referralGroupCollection from "./umbraco-api/tools/referral-group/index.js";
import referralScoringCollection from "./umbraco-api/tools/referral-scoring/index.js";
import reportingCollection from "./umbraco-api/tools/reporting/index.js";
import searchTermsCollection from "./umbraco-api/tools/search-terms/index.js";
import segmentsCollection from "./umbraco-api/tools/segments/index.js";
import statisticsCollection from "./umbraco-api/tools/statistics/index.js";
import suspiciousActivityCollection from "./umbraco-api/tools/suspicious-activity/index.js";
import trafficFilterCollection from "./umbraco-api/tools/traffic-filter/index.js";
import userGroupPermissionsCollection from "./umbraco-api/tools/user-group-permissions/index.js";

export const collections = [
  packageCollection,
  abTestCollection,
  abTestProjectCollection,
  abTestVariantCollection,
  addOnsCollection,
  analyticsCollection,
  annotationsCollection,
  appliedPersonalizationCollection,
  campaignGroupCollection,
  campaignsCollection,
  configurationCollection,
  contentScoringCollection,
  contentTypesCollection,
  culturesCollection,
  customerJourneyCollection,
  dataCleanupCollection,
  documentTypePermissionsCollection,
  goalCollection,
  goalsCollection,
  heatmapsCollection,
  mainSwitchCollection,
  personaCollection,
  profileCollection,
  referralGroupCollection,
  referralScoringCollection,
  reportingCollection,
  searchTermsCollection,
  segmentsCollection,
  statisticsCollection,
  suspiciousActivityCollection,
  trafficFilterCollection,
  userGroupPermissionsCollection,
];

export { allModes, allModeNames } from "./config/mode-registry.js";
export { allSliceNames } from "./config/slice-registry.js";
