/**
 * A/B Test Project CRUD Eval Tests
 *
 * These tests use the Claude Agent SDK to verify that the MCP tools
 * work correctly when invoked by an LLM agent, against a real Umbraco
 * Engage instance (see helpers/e2e-setup.ts for why: the mock API layer
 * only understands a leftover template shape and can't serve any real
 * Engage endpoint).
 *
 * The agent is given a prompt and access to specific tools, then we verify:
 * - The correct tools were called
 * - The agent reports success
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("A/B Test Project CRUD Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should complete full CRUD workflow",
    runScenarioTest({
      prompt: `Complete the following tasks against the Umbraco Engage A/B Test Project API:
1. Create a new A/B test project named "Agent Test Project" with description "Created by eval test". Fill in any other required fields with reasonable defaults (e.g. a fresh id/unique, zero counts, the current timestamp).
2. List all A/B test projects to confirm it was created.
3. Update the project you created to change its name to "Updated Agent Project" (keep its unique the same).
4. Delete the project you created.
Report on each step as you complete it.`,
      tools: [
        "post-ab-test-project",
        "get-ab-test-project-all",
        "put-ab-test-project",
        "delete-ab-test-project",
      ],
      requiredTools: [
        "post-ab-test-project",
        "get-ab-test-project-all",
        "put-ab-test-project",
        "delete-ab-test-project",
      ],
      successPattern: /created|updated|deleted/i,
      verbose: true,
    }),
    timeout
  );
});
