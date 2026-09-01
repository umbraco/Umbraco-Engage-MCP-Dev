import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postAbTestProjectBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

// Fixed unique so the fixture matches the checked-in snapshot exactly across runs/environments.
export const TEST_AB_TEST_PROJECT_UNIQUE = "12efe737-6e67-47a5-b0bd-d6c5ea5bb61c";
export const TEST_AB_TEST_PROJECT_NAME = "Test project";

type AbTestProjectModel = z.infer<typeof postAbTestProjectBody>;

export class AbTestProjectBuilder {
  private model: AbTestProjectModel = {
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
  };

  private createdId?: string;
  private createdNumericId?: number;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  withUnique(unique: string): this {
    this.model.unique = unique;
    return this;
  }

  build(): AbTestProjectModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postAbTestProjectBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postAbTestProject(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create A/B test project: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // post-ab-test-project honors whatever `unique` is supplied in the
    // request body rather than generating/overriding it server-side.
    this.createdId = response.data?.unique ?? validated.unique;
    this.createdNumericId = response.data?.id;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteAbTestProject(
        { id: this.createdId },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdId = undefined;
    }
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("A/B test project not created yet. Call create() first.");
    }
    return this.createdId;
  }

  /** The project's numeric `id` - what post-ab-test's `projectId` field actually expects (NOT `unique`/getId()). */
  getNumericId(): number {
    if (this.createdNumericId === undefined) {
      throw new Error("A/B test project not created yet. Call create() first.");
    }
    return this.createdNumericId;
  }
}
