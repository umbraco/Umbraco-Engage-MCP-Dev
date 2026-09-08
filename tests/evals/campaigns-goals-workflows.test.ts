/**
 * Campaigns & Goals Workflow Eval Tests
 *
 * Covers campaign-group/campaigns (organizing UTM traffic), goal/goals
 * (conversion goal definitions), and annotations (timeline markers on
 * analytics data) - phrased as a marketer's actual asks, not mechanical
 * "call tool X" steps.
 */
import { describe, it, beforeAll, afterAll } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";
import { ContentPageFixture, disconnectChainedCms } from "../../src/testing/content-page-fixture.js";

const ts = Date.now();

describe("Campaigns & Goals Workflows", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "marketer creates a campaign group to organize UTM traffic, then cleans it up",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Check for any UTM campaign traffic that hasn't been assigned to a group yet, using get-campaign-group-unscored.
2. Create a new campaign group named "Eval Campaign Group ${ts}" with description "Created by eval test" using post-campaign-group - do not pass an id or unique, let it create a new one.
3. List all campaign groups using get-campaign-group-all to confirm it was created, and note its numeric id and unique guid.
4. Get the full details of the group you created using get-campaign-group with its unique guid.
5. Rename the group to "Eval Campaign Group Updated ${ts}" by calling post-campaign-group again with the SAME id and unique - you must also pass back its current campaigns, customerJourneyScoring, and personaScoring arrays exactly as returned in step 4, otherwise those associations get wiped.
6. Delete the group using delete-campaign-group with its unique guid.
Report on each step, then say "Campaign group workflow completed".`,
      tools: [
        "get-campaign-group-unscored",
        "post-campaign-group",
        "get-campaign-group-all",
        "get-campaign-group",
        "delete-campaign-group",
      ],
      requiredTools: [
        "post-campaign-group",
        "get-campaign-group-all",
        "get-campaign-group",
        "delete-campaign-group",
      ],
      successPattern: "Campaign group workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );

  it(
    "marketer reviews UTM touchpoints and campaign group traffic",
    runScenarioTest({
      prompt:
        "Give me an overview of our campaign traffic: list the UTM touchpoints recorded site-wide using get-campaigns, then check visitor counts per campaign group over the last 30 days using get-campaign-group-visitors. Report what you find, even if the data comes back empty.",
      tools: ["get-campaigns", "get-campaign-group-visitors", "get-campaign-group-all"],
      requiredTools: ["get-campaigns", "get-campaign-group-visitors"],
      successPattern: /campaign|touchpoint|visitor|empty|no data|none/i,
      verbose: true,
    }),
    timeout
  );

  it(
    "marketer defines a new conversion goal and confirms it's tracked",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Find the goal type aliased "CustomGoal" using get-goal-all-types, and note its real id.
2. Create a new goal named "Eval Signup Goal ${ts}" using that goal type id, with value 1 and goalTypeConfig "{}".
3. Resolve the goal's full details by calling get-goal-details with the goal's returned unique guid.
4. List all goals using get-goals-all to confirm your new goal appears.
Report on each step, then say "Goal workflow completed".`,
      tools: [
        "get-goal-all-types",
        "post-goal",
        "get-goal-details",
        "get-goals-all",
        "get-goals-main",
      ],
      requiredTools: ["get-goal-all-types", "post-goal", "get-goal-details", "get-goals-all"],
      successPattern: "Goal workflow completed",
      verbose: true,
      options: { maxTurns: 15 },
    }),
    timeout
  );

  describe("annotation on a real content page", () => {
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
      "marketer marks a campaign launch with a timeline annotation",
      () => {
        const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const to = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        return runScenarioTest({
          prompt: `You're marking the launch of a new campaign on a real content page. The page's unique id is "${pageUnique}" - use it exactly as given, do not invent your own.
Complete these tasks in order:
1. Create an annotation with description "Eval campaign launch ${ts}", createdByUserName "eval-test", visibility "Published", attached to page "${pageUnique}" via pageVariants (a single entry with that unique).
2. Confirm it shows up by calling get-annotations-page for that same page unique.
3. Confirm it also shows up site-wide by calling get-annotations-all with from "${from}" and to "${to}".
4. Delete the annotation using its numeric id from step 1's result.
Report on each step, then say "Annotation workflow completed".`,
          tools: [
            "post-annotations",
            "get-annotations-page",
            "get-annotations-all",
            "delete-annotations",
          ],
          requiredTools: [
            "post-annotations",
            "get-annotations-page",
            "get-annotations-all",
            "delete-annotations",
          ],
          successPattern: "Annotation workflow completed",
          verbose: true,
          options: { maxTurns: 15 },
        })();
      },
      timeout
    );
  });
});
