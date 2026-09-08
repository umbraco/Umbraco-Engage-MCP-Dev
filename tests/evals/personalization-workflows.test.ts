/**
 * Personalization Workflow Eval Tests
 *
 * Covers persona, segments, applied-personalization, and customer-journey -
 * phrased as a marketer's actual asks, not mechanical "call tool X" steps.
 *
 * Deliberately NOT scripted here (confirmed unreachable/dead-end via a
 * research pass over these collections' tools and their own integration
 * tests):
 * - post-persona-lock/-unlock and post-customer-journey-lock/-unlock need a
 *   real numeric visitor id, which nothing in this MCP surface can produce.
 * - post-applied-personalization-segment returns a hard 400 unconditionally
 *   (the collection's own integration test asserts the failure).
 */
import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const ts = Date.now();

describe("Personalization Workflows", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "marketer defines a persona group and inspects it",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a persona group named "Eval Persona Group ${ts}" containing two personas titled "Eval Explorer ${ts}" and "Eval Loyalist ${ts}" using post-persona.
2. List all persona groups using get-persona-all to confirm it appears.
3. Get its full details using get-persona-details with its unique guid.
4. Delete the persona group using delete-persona with its unique guid.
Report on each step, then say "Persona workflow completed".`,
      tools: ["post-persona", "get-persona-all", "get-persona-details", "delete-persona"],
      requiredTools: ["post-persona", "get-persona-all", "get-persona-details", "delete-persona"],
      successPattern: "Persona workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );

  it(
    "marketer creates a visitor segment, reorders it, then cleans up",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new segment named "Eval Segment ${ts}" with no targeting rules yet (an empty rules array) using post-segments - do not pass an id or unique, let it create a new one.
2. List all segments using get-segments-all to confirm it was created, and note its numeric id and unique guid.
3. Get its full details using get-segments with its unique guid.
4. Rename it to "Eval Segment Updated ${ts}" by calling post-segments again with the SAME id and unique - you must also pass back its current rules array exactly as returned in step 3 (even if empty), otherwise its rules get wiped.
5. Give it sort priority 0 using post-segments-update-priority with its numeric id.
6. Delete it using delete-segments with its unique guid.
Report on each step, then say "Segment workflow completed".`,
      tools: [
        "post-segments",
        "get-segments-all",
        "get-segments",
        "post-segments-update-priority",
        "delete-segments",
      ],
      requiredTools: [
        "post-segments",
        "get-segments-all",
        "get-segments",
        "post-segments-update-priority",
        "delete-segments",
      ],
      successPattern: "Segment workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );

  it(
    "marketer personalizes content for a segment, then cleans up",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new segment named "Eval Personalization Segment ${ts}" using post-segments (no rules needed) - do not pass an id or unique.
2. List all segments using get-segments-all to find the numeric id of the segment you just created.
3. Create an applied personalization rule named "Eval Personalization ${ts}" of type "SinglePage" targeting that segment via segmentId - leave pages and contentTypes as empty arrays, since this rule targets by segment only, not by specific page.
4. List all applied personalization rules using get-applied-personalization-all to confirm it appears, and note its unique guid.
5. Get it by that guid using get-applied-personalization-id.
6. Delete it using delete-applied-personalization.
7. Delete the segment you created in step 1 using delete-segments.
Report on each step, then say "Applied personalization workflow completed".`,
      tools: [
        "post-segments",
        "get-segments-all",
        "post-applied-personalization",
        "get-applied-personalization-all",
        "get-applied-personalization-id",
        "delete-applied-personalization",
        "delete-segments",
      ],
      requiredTools: [
        "post-segments",
        "get-segments-all",
        "post-applied-personalization",
        "get-applied-personalization-all",
        "get-applied-personalization-id",
        "delete-applied-personalization",
      ],
      successPattern: "Applied personalization workflow completed",
      verbose: true,
      options: { maxTurns: 20 },
    }),
    timeout
  );

  it(
    "marketer maps out a customer journey and inspects it",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a customer journey named "Eval Journey ${ts}" containing two steps titled "Eval Awareness ${ts}" and "Eval Conversion ${ts}" using post-customer-journey.
2. List all customer journeys using get-customer-journey-all to confirm it appears.
3. Get its full details using get-customer-journey-details with its unique guid.
4. Delete the journey using delete-customer-journey with its unique guid.
Report on each step, then say "Customer journey workflow completed".`,
      tools: [
        "post-customer-journey",
        "get-customer-journey-all",
        "get-customer-journey-details",
        "delete-customer-journey",
      ],
      requiredTools: [
        "post-customer-journey",
        "get-customer-journey-all",
        "get-customer-journey-details",
        "delete-customer-journey",
      ],
      successPattern: "Customer journey workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );
});
