/**
 * Scoring Workflow Eval Tests
 *
 * Covers content-scoring (linking a real page to a persona/journey score),
 * referral-scoring (read-only referral traffic views), and referral-group
 * (organizing referring pages) - phrased as a marketer's actual asks, not
 * mechanical "call tool X" steps.
 */
import { describe, it, beforeAll, afterAll } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";
import { ContentPageFixture, disconnectChainedCms } from "../../src/testing/content-page-fixture.js";

const ts = Date.now();

describe("Scoring Workflows", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  describe("content scoring on a real page", () => {
    const contentPage = new ContentPageFixture();
    let pageUnique: string;

    beforeAll(async () => {
      await contentPage.create();
      pageUnique = contentPage.getKey();
    }, 60000);

    afterAll(async () => {
      await contentPage.delete();
      await disconnectChainedCms();
    }, 60000);

    it(
      "marketer scores a real page against a target persona",
      () =>
        runScenarioTest({
          prompt: `You're scoring a real content page against a target persona. The page's unique id is "${pageUnique}" - use it exactly as given, do not invent your own.
Complete these tasks in order:
1. Create a persona group named "Eval Persona Group ${ts}" containing one persona titled "Eval Persona ${ts}" using post-persona.
2. Get the group's full details using get-persona-details with the group's returned unique. Note the individual persona's own numeric id (personas[0].id in the response) - this is the "entityId" you need next, NOT the group's unique.
3. Save a content-scoring row using post-content-scoring-save: one item with id 0, documentUnique "${pageUnique}", entityId from step 2, type "Persona", score 5, isLocked false.
4. post-content-scoring-save does not return the saved row, so list the page's scoring rows using get-content-scoring-all with unique "${pageUnique}" to find the row you just created and note its id.
5. Delete that row using delete-content-scoring-persona with the id you found in step 4.
Report on each step, then say "Content scoring workflow completed".`,
          tools: [
            "post-persona",
            "get-persona-details",
            "post-content-scoring-save",
            "get-content-scoring-all",
            "delete-content-scoring-persona",
          ],
          requiredTools: [
            "post-persona",
            "get-persona-details",
            "post-content-scoring-save",
            "get-content-scoring-all",
            "delete-content-scoring-persona",
          ],
          successPattern: "Content scoring workflow completed",
          verbose: true,
          options: { maxTurns: 20 },
        })(),
      timeout
    );
  });

  it(
    "marketer checks referral traffic that's been scored vs. not",
    runScenarioTest({
      prompt:
        "Check our referral traffic: list referral URLs that already have a score using post-referral-scoring-scored, then list ones that haven't been scored yet using post-referral-scoring-unscored. Report what you find, even if the results come back empty.",
      tools: ["post-referral-scoring-scored", "post-referral-scoring-unscored"],
      requiredTools: ["post-referral-scoring-scored", "post-referral-scoring-unscored"],
      successPattern: /referral|scored|unscored|empty|no data|none/i,
      verbose: true,
    }),
    timeout
  );

  it(
    "marketer organizes referring pages into a group, then cleans up",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new referral group named "Eval Referral Group ${ts}" with description "Created by eval test" using post-referral-group - do not pass an id or unique, let it create a new one.
2. List all referral groups using get-referral-group-all to confirm it was created, and note its numeric id and unique guid.
3. Get its full details using get-referral-group with its unique guid.
4. Check visitor counts across referral groups over the last 30 days using get-referral-group-visitors.
5. Rename the group to "Eval Referral Group Updated ${ts}" by calling post-referral-group again with the SAME id and unique - you must also pass back its current pages, customerJourneyScoring, and personaScoring arrays exactly as returned in step 3, otherwise those associations get wiped.
6. Delete the group using delete-referral-group with its unique guid.
Report on each step, then say "Referral group workflow completed".`,
      tools: [
        "post-referral-group",
        "get-referral-group-all",
        "get-referral-group",
        "get-referral-group-visitors",
        "delete-referral-group",
      ],
      requiredTools: [
        "post-referral-group",
        "get-referral-group-all",
        "get-referral-group",
        "delete-referral-group",
      ],
      successPattern: "Referral group workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );
});
