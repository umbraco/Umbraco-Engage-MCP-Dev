#!/usr/bin/env node
/**
 * MCP Server Entry Point
 *
 * This file sets up and starts the MCP server.
 * Customize this to add your tool collections.
 */

import "dotenv/config";
import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJson from "../package.json" with { type: "json" };
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  configureApiClient,
  initializeUmbracoFetch,
  createToolAnnotations,
  discoverProxiedTools,
  parseProxiedToolName,
  createCollectionConfigLoader,
  shouldIncludeTool,
  handleCliCommands,
  type CollectionConfiguration,
} from "@umbraco-cms/mcp-server-sdk";

// Import the Orval-generated API client
import { getUmbracoEngageManagementAPI } from "./umbraco-api/api/generated/umbracoEngageManagementApi.js";

// Import tool collections
import chainedCollection from "./umbraco-api/tools/chained/index.js";
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
import cockpitCollection from "./umbraco-api/tools/cockpit/index.js";
import cockpitAuthCollection from "./umbraco-api/tools/cockpit-auth/index.js";
import configurationCollection from "./umbraco-api/tools/configuration/index.js";
import contentScoringCollection from "./umbraco-api/tools/content-scoring/index.js";
import contentTypesCollection from "./umbraco-api/tools/content-types/index.js";
import culturesCollection from "./umbraco-api/tools/cultures/index.js";
import customerJourneyCollection from "./umbraco-api/tools/customer-journey/index.js";
import dataCleanupCollection from "./umbraco-api/tools/data-cleanup/index.js";
import dataGenerationCollection from "./umbraco-api/tools/data-generation/index.js";
import documentTypePermissionsCollection from "./umbraco-api/tools/document-type-permissions/index.js";
import goalCollection from "./umbraco-api/tools/goal/index.js";
import goalsCollection from "./umbraco-api/tools/goals/index.js";
import heatmapsCollection from "./umbraco-api/tools/heatmaps/index.js";
import mainSwitchCollection from "./umbraco-api/tools/main-switch/index.js";
import pageDataCollection from "./umbraco-api/tools/page-data/index.js";
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

// Import MCP client manager (for chaining to other MCP servers)
import { mcpClientManager } from "./umbraco-api/mcp-client.js";

// Import MCP server chain configuration
import { mcpServers } from "./config/mcp-servers.js";

// Import registries for tool filtering
import { allModes, allModeNames, allSliceNames, loadServerConfig, clearConfigCache } from "./config/index.js";

// Initialize the SDK's fetch client for real Umbraco API calls.
// This enables the Orval-generated client to authenticate via client_credentials.
const baseUrl = process.env.UMBRACO_BASE_URL || "";
const clientId = process.env.UMBRACO_CLIENT_ID || "";
const clientSecret = process.env.UMBRACO_CLIENT_SECRET || "";
if (clientId) {
  if (!baseUrl) {
    console.error("Error: UMBRACO_BASE_URL is required");
    process.exit(1);
  }
  initializeUmbracoFetch({ baseUrl, clientId, clientSecret });
}

// Configure the API client for use with toolkit helpers
// This connects your generated Orval client to executeGetApiCall, executeVoidApiCall, etc.
configureApiClient(() => getUmbracoEngageManagementAPI());

// ============================================================================
// MCP Server Setup
// ============================================================================

// Create MCP server.
// Pass an optional `instructions` string in the second argument to send
// server-level guidance to clients during `initialize`. Most clients fold
// this into the model's system prompt, so it applies implicitly without
// per-tool repetition. Mirror the same value in `worker.ts` so stdio and
// hosted deployments behave consistently.
//
// const server = new McpServer(
//   { name: "umbraco-engage-editor-mcp", version: packageJson.version },
//   { instructions: "When summarising results, refer to items by name, not by ID." },
// );
const server = new McpServer({
  name: "umbraco-engage-editor-mcp",
  version: packageJson.version,
});

// ============================================================================
// Tool Filtering Setup
// ============================================================================

// Clear config cache to ensure fresh config for each server start
clearConfigCache();

// Load server configuration (includes filtering settings from env vars)
const serverConfig = await loadServerConfig(true);

// Create collection config loader with our registries
const configLoader = createCollectionConfigLoader({
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
});

// Load filtering configuration from server config
const filterConfig: CollectionConfiguration = configLoader.loadFromConfig(serverConfig.umbraco);

// ============================================================================
// CLI Introspection (runs before server start, exits immediately)
// ============================================================================

const collections = [
  chainedCollection,
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
  cockpitCollection,
  cockpitAuthCollection,
  configurationCollection,
  contentScoringCollection,
  contentTypesCollection,
  culturesCollection,
  customerJourneyCollection,
  dataCleanupCollection,
  dataGenerationCollection,
  documentTypePermissionsCollection,
  goalCollection,
  goalsCollection,
  heatmapsCollection,
  mainSwitchCollection,
  pageDataCollection,
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

// handleCliCommands checks --list-tools, --describe-tool, --generate-context, --call.
// If any flag is set it prints output and calls process.exit(0).
// Otherwise it returns and the server continues to start.
await handleCliCommands(collections, {
  cliFlags: serverConfig.cliFlags,
  serverName: "my-umbraco-mcp",
  serverVersion: packageJson.version,
  filterConfig,
  serverConfig: serverConfig.umbraco,
});

// ============================================================================
// Register Tools with Filtering
// ============================================================================

let registeredToolCount = 0;

for (const collection of collections) {
  const collectionName = collection.metadata.name;

  // Get tools for current user (pass user context if needed)
  const tools = collection.tools({});

  for (const tool of tools) {
    // Check if tool should be included based on filtering config
    if (!shouldIncludeTool(tool, { collectionName, config: filterConfig })) {
      continue;
    }

    // Build annotations from tool definition
    const annotations = createToolAnnotations(tool);

    // Register tool with MCP server using registerTool API
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations,
    }, tool.handler as ToolCallback<typeof tool.inputSchema>);

    registeredToolCount++;
  }
}

// Start the server
async function main() {
  // Discover and register proxied tools from chained MCP servers
  // Skip if chaining is disabled via config (DISABLE_MCP_CHAINING=true)
  const chainingEnabled = mcpServers.length > 0 && !serverConfig.custom.disableMcpChaining;

  if (chainingEnabled) {
    try {
      const proxiedTools = await discoverProxiedTools(mcpClientManager);

      for (const pt of proxiedTools) {
        // Register proxied tool with forwarding handler
        // Note: We don't pass inputSchema since validation happens on the chained server
        // and the MCP SDK expects Zod schemas, not raw JSON Schema objects
        server.registerTool(
          pt.prefixedName,
          {
            description: `[Proxied from ${pt.serverName}] ${pt.originalTool.description || "No description"}`,
          },
          async (args: Record<string, unknown>): Promise<CallToolResult> => {
            const { serverName, toolName } = parseProxiedToolName(pt.prefixedName);
            const result = await mcpClientManager.callTool(serverName, toolName, args);
            return result as CallToolResult;
          }
        );
      }

      if (proxiedTools.length > 0) {
        console.error(`Registered ${proxiedTools.length} proxied tool(s) from chained MCP servers`);
      }
    } catch (error) {
      console.error("Warning: Failed to discover proxied tools:", error);
      // Continue without proxied tools - local tools still work
    }
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`MCP Server started with ${registeredToolCount} tool(s) from ${collections.length} collection(s)`);
}

// Cleanup on shutdown
process.on("SIGINT", async () => {
  await mcpClientManager.disconnectAll();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mcpClientManager.disconnectAll();
  process.exit(0);
});

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
