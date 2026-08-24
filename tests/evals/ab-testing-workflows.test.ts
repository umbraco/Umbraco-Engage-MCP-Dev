/**
 * A/B Testing Workflow Eval Tests
 *
 * A/B testing is Umbraco Engage's flagship feature: compare variants of a
 * real content page against a real conversion goal. These scenarios drive
 * the full chain an agent needs to reason through - resolving a real goal
 * type, creating a goal, targeting a real published page, adding variants,
 * and checking results - phrased as a marketer would ask, not as mechanical
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

describe("A/B Testing Workflows", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  describe("full test lifecycle against a real page", () => {
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
      "marketer launches and manages an A/B test end to end",
      () =>
        runScenarioTest({
          prompt: `You're a growth marketer setting up an A/B test on a real content page. The page's unique id is "${pageUnique}" - use it exactly as given, do not invent your own.
Complete these tasks in order:
1. Find the goal type aliased "CustomGoal" using get-goal-all-types.
2. Create a new goal named "Eval Signup Goal ${ts}" using that goal type, with value 1, marking it active (isActive true), not main, not inverted, not invalid, and with implicit scoring disabled.
3. Resolve the goal's real numeric id by calling get-goal-details with the goal's returned unique guid.
4. Create a new A/B test named "Eval Homepage Test ${ts}" of testType "SinglePage", targeting page "${pageUnique}", using the goal you just created for both goalId (the numeric id) and goal (the same goal's full details, matching goalTypeId/value/flags).
5. List all A/B tests to confirm your new test exists.
6. Add a brand new third variant to the test using post-ab-test-variant-create, passing the test's numeric id.
7. Get the test's live view model to see all its variants.
8. Delete the A/B test.
Report on each step as you complete it, then say "A/B test workflow completed".`,
          tools: [
            "get-goal-all-types",
            "post-goal",
            "get-goal-details",
            "post-ab-test",
            "get-ab-test-all",
            "post-ab-test-variant-create",
            "get-ab-test-view-model",
            "delete-ab-test",
          ],
          requiredTools: [
            "get-goal-all-types",
            "post-goal",
            "get-goal-details",
            "post-ab-test",
            "get-ab-test-all",
            "post-ab-test-variant-create",
            "get-ab-test-view-model",
            "delete-ab-test",
          ],
          successPattern: "A/B test workflow completed",
          verbose: true,
          options: { maxTurns: 20 },
        })(),
      timeout
    );
  });

  it(
    "marketer checks how existing A/B tests are performing",
    runScenarioTest({
      prompt:
        "List all A/B test projects and all A/B tests. If any tests exist, pick one and get its live view model to see how each variant is performing. Report what you find, including if there are none yet.",
      tools: ["get-ab-test-project-all", "get-ab-test-all", "get-ab-test-view-model"],
      requiredTools: ["get-ab-test-all"],
      successPattern: /test|variant|no test|none/i,
      verbose: true,
    }),
    timeout
  );

  it(
    "marketer organizes tests into a project",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new A/B test project named "Eval Project ${ts}" to group future tests under, with description "Created by eval test".
2. List all A/B test projects to confirm it was created.
3. Rename the project to "Eval Project Updated ${ts}" using put-ab-test-project (keep its unique the same).
4. Delete the project.
Report on each step, then say "Project workflow completed".`,
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
      successPattern: "Project workflow completed",
      verbose: true,
    }),
    timeout
  );
});
