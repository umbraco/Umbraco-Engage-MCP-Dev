import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

// Fixed unique so the fixture matches the checked-in snapshot exactly across runs/environments.
export const TEST_AB_TEST_PROJECT_UNIQUE = "12efe737-6e67-47a5-b0bd-d6c5ea5bb61c";
export const TEST_AB_TEST_PROJECT_NAME = "Test project";

export class AbTestProjectBuilder {
  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postAbTestProject(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: TEST_AB_TEST_PROJECT_UNIQUE,
        name: TEST_AB_TEST_PROJECT_NAME,
        description: TEST_AB_TEST_PROJECT_NAME,
        createdByUmbracoUserName: "Engage",
        amountOfTests: 0,
        amountOfActiveTests: 0,
        invalid: false,
        archived: false,
        abTests: [],
      },
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create A/B test project: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    return this;
  }

  async delete(): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteAbTestProject(
        { id: TEST_AB_TEST_PROJECT_UNIQUE },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    }
  }
}
