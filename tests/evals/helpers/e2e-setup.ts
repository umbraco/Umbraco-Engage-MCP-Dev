/**
 * Eval Test Setup
 *
 * Configures the eval test framework for this MCP server.
 * This runs before any tests via setupFilesAfterEnv in jest.config.ts.
 */

import path from "path";
import { jest } from "@jest/globals";
import { configureEvals, ClaudeModels } from "@umbraco-cms/mcp-server-sdk/evals";

// LLM responses are non-deterministic — retry a flaky eval once before failing.
jest.retryTimes(1, { logErrorsBeforeRetry: true });

// Configure the eval framework for this MCP server.
//
// USE_MOCK_API is deliberately NOT set here: src/umbraco-api/api/client.ts's
// mock mode only understands a leftover template `/item` CRUD shape and
// returns 404 for every real Engage endpoint, so every real tool call would
// fail in mock mode. This project has a real Umbraco+Engage instance
// available (the same one integration tests run against), so evals run
// against it directly, same as umbraco-mcp-dev-cms's working eval setup.
configureEvals({
  // Path to the built MCP server
  mcpServerPath: path.resolve(process.cwd(), "dist/index.js"),

  // MCP server name (used in tool name prefixes like mcp__umbraco-engage-editor-mcp__tool-name)
  mcpServerName: "umbraco-engage-editor-mcp",

  // Environment variables for the MCP server — real Umbraco+Engage instance.
  serverEnv: {
    UMBRACO_CLIENT_ID: process.env.UMBRACO_CLIENT_ID || "umbraco-back-office-mcp",
    UMBRACO_CLIENT_SECRET: process.env.UMBRACO_CLIENT_SECRET || "1234567890",
    UMBRACO_BASE_URL: process.env.UMBRACO_BASE_URL || "https://localhost:44448",
    NODE_TLS_REJECT_UNAUTHORIZED: "0",
    DISABLE_MCP_CHAINING: "true",
  },

  // Test defaults
  defaultModel: ClaudeModels.Haiku,
  defaultMaxTurns: 10,
  defaultMaxBudgetUsd: 0.25,
  defaultTimeoutMs: 60000,
});
