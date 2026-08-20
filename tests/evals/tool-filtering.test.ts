/**
 * Tool Filtering Eval Tests
 *
 * Tests that verify the MCP server correctly filters tools based on
 * environment variable configuration:
 * - UMBRACO_INCLUDE_SLICES / UMBRACO_EXCLUDE_SLICES
 * - UMBRACO_INCLUDE_TOOL_COLLECTIONS / UMBRACO_EXCLUDE_TOOL_COLLECTIONS
 * - UMBRACO_TOOL_MODES
 * - UMBRACO_INCLUDE_TOOLS / UMBRACO_EXCLUDE_TOOLS
 *
 * These tests use `useServerFiltering: true` to let the server handle
 * tool filtering rather than the test harness. They only ever list tools
 * (maxTurns: 1, no tool calls are actually made), so USE_MOCK_API is safe
 * here even though it can't serve any real Engage endpoint — see
 * helpers/e2e-setup.ts for why the other eval tests don't use it.
 *
 * Two collections are used as filtering targets because their tool slices
 * don't overlap and they belong to different modes (verified against
 * src/config/mode-registry.ts and each tool's own `slices` array):
 * - `ab-test-project`: read (get-ab-test-project, get-ab-test-project-details),
 *   list (get-ab-test-project-all), create (post-ab-test-project),
 *   update (put-ab-test-project), delete (delete-ab-test-project) — in the
 *   `ab-testing` mode.
 * - `document-type-permissions`: read (get-permissions-document-type), list
 *   (get-permissions-document-type-all), create
 *   (post-permissions-document-type), no update/delete tools — in the
 *   `administration` mode.
 */

import { describe, it, expect } from "@jest/globals";
import {
  runAgentTest,
  getShortToolName,
  getDefaultTimeoutMs,
  setupConsoleMock,
} from "@umbraco-cms/mcp-server-sdk/evals";

/**
 * Base env vars required for all filtering tests.
 * The server requires auth credentials even when using mock API.
 * DISABLE_MCP_CHAINING prevents attempting to connect to chained MCP servers.
 */
const BASE_ENV = {
  USE_MOCK_API: "true",
  DISABLE_MCP_CHAINING: "true",
  UMBRACO_CLIENT_ID: "test-client",
  UMBRACO_CLIENT_SECRET: "test-secret",
  UMBRACO_BASE_URL: "http://localhost:9999",
};

describe("Tool Filtering", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  describe("Slice Filtering", () => {
    it(
      "should only expose read-slice tools when UMBRACO_INCLUDE_SLICES=read",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [], // Empty tools array - let server filtering decide
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_SLICES: "read",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // Read slice tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-permissions-document-type");

        // Non-read tools should NOT be available
        expect(shortNames).not.toContain("get-ab-test-project-all"); // list slice
        expect(shortNames).not.toContain("post-ab-test-project");
        expect(shortNames).not.toContain("put-ab-test-project");
        expect(shortNames).not.toContain("delete-ab-test-project");
        expect(shortNames).not.toContain("post-permissions-document-type");
      },
      timeout
    );

    it(
      "should only expose read and list tools when UMBRACO_INCLUDE_SLICES=read,list",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_SLICES: "read,list",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // Read and list slice tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");

        // Create/update/delete should NOT be available
        expect(shortNames).not.toContain("post-ab-test-project");
        expect(shortNames).not.toContain("put-ab-test-project");
        expect(shortNames).not.toContain("delete-ab-test-project");
      },
      timeout
    );

    it(
      "should exclude delete tools when UMBRACO_EXCLUDE_SLICES=delete",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_EXCLUDE_SLICES: "delete",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // All non-delete tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("post-ab-test-project");
        expect(shortNames).toContain("put-ab-test-project");

        // Delete tools should NOT be available
        expect(shortNames).not.toContain("delete-ab-test-project");
      },
      timeout
    );
  });

  describe("Collection Filtering", () => {
    it(
      "should only expose ab-test-project collection when UMBRACO_INCLUDE_TOOL_COLLECTIONS=ab-test-project",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_TOOL_COLLECTIONS: "ab-test-project",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // ab-test-project collection tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("post-ab-test-project");
        expect(shortNames).toContain("put-ab-test-project");
        expect(shortNames).toContain("delete-ab-test-project");

        // document-type-permissions collection tools should NOT be available
        expect(shortNames).not.toContain("get-permissions-document-type");
        expect(shortNames).not.toContain("get-permissions-document-type-all");
        expect(shortNames).not.toContain("post-permissions-document-type");
      },
      timeout
    );

    it(
      "should only expose document-type-permissions collection when UMBRACO_INCLUDE_TOOL_COLLECTIONS=document-type-permissions",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_TOOL_COLLECTIONS: "document-type-permissions",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // document-type-permissions collection tools should be available
        expect(shortNames).toContain("get-permissions-document-type");
        expect(shortNames).toContain("get-permissions-document-type-all");
        expect(shortNames).toContain("post-permissions-document-type");

        // ab-test-project collection tools should NOT be available
        expect(shortNames).not.toContain("get-ab-test-project");
        expect(shortNames).not.toContain("get-ab-test-project-all");
        expect(shortNames).not.toContain("post-ab-test-project");
      },
      timeout
    );

    it(
      "should exclude ab-test-project collection when UMBRACO_EXCLUDE_TOOL_COLLECTIONS=ab-test-project",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_EXCLUDE_TOOL_COLLECTIONS: "ab-test-project",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // ab-test-project collection tools should NOT be available
        expect(shortNames).not.toContain("get-ab-test-project");
        expect(shortNames).not.toContain("get-ab-test-project-all");
        expect(shortNames).not.toContain("post-ab-test-project");

        // document-type-permissions collection tools SHOULD be available
        expect(shortNames).toContain("get-permissions-document-type");
        expect(shortNames).toContain("get-permissions-document-type-all");
        expect(shortNames).toContain("post-permissions-document-type");
      },
      timeout
    );
  });

  describe("Mode Filtering", () => {
    it(
      "should expose the ab-testing mode's collections when UMBRACO_TOOL_MODES=ab-testing",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_TOOL_MODES: "ab-testing",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // ab-testing mode includes the ab-test-project collection
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("post-ab-test-project");

        // administration mode's collections should NOT be available
        expect(shortNames).not.toContain("get-permissions-document-type");
        expect(shortNames).not.toContain("get-permissions-document-type-all");
      },
      timeout
    );

    it(
      "should expose the administration mode's collections when UMBRACO_TOOL_MODES=administration",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_TOOL_MODES: "administration",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // administration mode includes the document-type-permissions collection
        expect(shortNames).toContain("get-permissions-document-type");
        expect(shortNames).toContain("get-permissions-document-type-all");
        expect(shortNames).toContain("post-permissions-document-type");

        // ab-testing mode's collections should NOT be available
        expect(shortNames).not.toContain("get-ab-test-project");
        expect(shortNames).not.toContain("get-ab-test-project-all");
      },
      timeout
    );
  });

  describe("Individual Tool Filtering", () => {
    it(
      "should only expose specific tools from both collections when UMBRACO_INCLUDE_TOOLS is set",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_TOOLS:
                "get-ab-test-project,get-ab-test-project-all,get-permissions-document-type",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // Only specified tools should be available (from both collections)
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("get-permissions-document-type");

        // Other tools from ab-test-project should NOT be available
        expect(shortNames).not.toContain("post-ab-test-project");
        expect(shortNames).not.toContain("put-ab-test-project");
        expect(shortNames).not.toContain("delete-ab-test-project");

        // Other tools from document-type-permissions should NOT be available
        expect(shortNames).not.toContain("get-permissions-document-type-all");
        expect(shortNames).not.toContain("post-permissions-document-type");
      },
      timeout
    );

    it(
      "should exclude specific tools from both collections when UMBRACO_EXCLUDE_TOOLS is set",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_EXCLUDE_TOOLS:
                "delete-ab-test-project,put-ab-test-project,post-permissions-document-type",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // Non-excluded tools from ab-test-project should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("post-ab-test-project");

        // Non-excluded tools from document-type-permissions should be available
        expect(shortNames).toContain("get-permissions-document-type");
        expect(shortNames).toContain("get-permissions-document-type-all");

        // Excluded tools should NOT be available
        expect(shortNames).not.toContain("delete-ab-test-project");
        expect(shortNames).not.toContain("put-ab-test-project");
        expect(shortNames).not.toContain("post-permissions-document-type");
      },
      timeout
    );
  });

  describe("Combined Filtering", () => {
    it(
      "should combine slice include with tool exclude",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: {
              ...BASE_ENV,
              UMBRACO_INCLUDE_SLICES: "read,list,create",
              UMBRACO_EXCLUDE_TOOLS: "post-ab-test-project",
            },
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // Read and list tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");

        // post-ab-test-project excluded even though create slice is included
        expect(shortNames).not.toContain("post-ab-test-project");

        // Update/delete not in included slices
        expect(shortNames).not.toContain("put-ab-test-project");
        expect(shortNames).not.toContain("delete-ab-test-project");
      },
      timeout
    );
  });

  describe("No Filtering (All Tools)", () => {
    it(
      "should expose all tools from both collections when no filtering env vars are set",
      async () => {
        const result = await runAgentTest(
          "List all available tools you can use.",
          [],
          {
            serverEnv: BASE_ENV,
            useServerFiltering: true,
            maxTurns: 1,
            verbosity: "quiet",
          }
        );

        const shortNames = result.availableTools.map(getShortToolName);

        // All ab-test-project collection tools should be available
        expect(shortNames).toContain("get-ab-test-project");
        expect(shortNames).toContain("get-ab-test-project-all");
        expect(shortNames).toContain("get-ab-test-project-details");
        expect(shortNames).toContain("post-ab-test-project");
        expect(shortNames).toContain("put-ab-test-project");
        expect(shortNames).toContain("delete-ab-test-project");

        // All document-type-permissions collection tools should be available
        expect(shortNames).toContain("get-permissions-document-type");
        expect(shortNames).toContain("get-permissions-document-type-all");
        expect(shortNames).toContain("post-permissions-document-type");
      },
      timeout
    );
  });
});
