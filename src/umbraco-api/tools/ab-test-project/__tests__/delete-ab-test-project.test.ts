import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  AbTestProjectBuilder,
  TEST_AB_TEST_PROJECT_UNIQUE,
} from "./setup.js";
import deleteAbTestProjectTool from "../delete/delete-ab-test-project.js";

describe("delete-ab-test-project", () => {
  setupTestEnvironment();

  it("deletes an existing A/B test project", async () => {
    await new AbTestProjectBuilder().create();
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestProjectTool.handler(
      { id: TEST_AB_TEST_PROJECT_UNIQUE },
      context,
    );

    expect(result.isError).toBeFalsy();
  });

  it("returns an error for a non-existent A/B test project id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteAbTestProjectTool.handler(
      { id: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
