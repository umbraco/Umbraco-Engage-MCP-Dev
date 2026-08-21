/**
 * Tool Mode Registry
 *
 * Defines tool modes that group tools by domain/functionality.
 * Modes map to collections, allowing users to enable groups of related tools.
 *
 * This is the SINGLE SOURCE OF TRUTH for mode definitions in this project.
 */

import type { ToolModeDefinition } from "@umbraco-cms/mcp-server-sdk";

/**
 * Tool mode definitions for this project.
 *
 * Each mode groups related tool collections together.
 * Users can enable modes in their config to include all tools in those collections.
 *
 * @example
 * ```typescript
 * // In server config
 * {
 *   toolModes: ['content', 'media']  // Enables all tools in content and media collections
 * }
 * ```
 */
export const toolModes: ToolModeDefinition[] = [
  {
    name: 'ab-testing',
    displayName: 'A/B Testing',
    description: 'A/B tests, projects, and variants',
    collections: ['ab-test', 'ab-test-project', 'ab-test-variant']
  },
  {
    name: 'analytics',
    displayName: 'Analytics & Reporting',
    description: 'Analytics queries, reporting, statistics, search terms and heatmaps',
    collections: ['analytics', 'reporting', 'statistics', 'search-terms', 'heatmaps']
  },
  {
    name: 'personalization',
    displayName: 'Personalization',
    description: 'Personas, segments, applied personalization and customer journeys',
    collections: ['persona', 'segments', 'applied-personalization', 'customer-journey']
  },
  {
    name: 'campaigns',
    displayName: 'Campaigns & Goals',
    description: 'Campaigns, campaign groups, goals and annotations',
    collections: ['campaigns', 'campaign-group', 'goal', 'goals', 'annotations']
  },
  {
    name: 'scoring',
    displayName: 'Scoring',
    description: 'Content and referral scoring',
    collections: ['content-scoring', 'referral-scoring', 'referral-group']
  },
  {
    name: 'administration',
    displayName: 'Administration',
    description: 'Configuration, permissions, data cleanup, main switch, package and add-ons',
    collections: [
      'configuration',
      'main-switch',
      'package',
      'add-ons',
      'cultures',
      'content-types',
      'document-type-permissions',
      'user-group-permissions',
      'data-cleanup',
      'data-generation',
      'traffic-filter',
      'suspicious-activity'
    ]
  },
  {
    name: 'profiles',
    displayName: 'Profiles',
    description: 'Visitor profiles',
    collections: ['profile']
  },
  {
    name: 'cockpit',
    displayName: 'Cockpit',
    description: 'Engage Cockpit and its authentication',
    collections: ['cockpit', 'cockpit-auth']
  },
];

/**
 * All mode definitions (alias for toolModes).
 */
export const allModes: ToolModeDefinition[] = [...toolModes];

/**
 * All valid mode names for configuration validation.
 */
export const allModeNames: readonly string[] = toolModes.map(m => m.name);

/**
 * Valid mode name type.
 */
export type ToolModeName = typeof allModeNames[number];
