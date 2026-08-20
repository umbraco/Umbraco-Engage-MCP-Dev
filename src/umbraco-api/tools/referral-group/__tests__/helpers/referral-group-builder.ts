import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postReferralGroupBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

export const TEST_REFERRAL_GROUP_NAME = "_Test Referral Group";

type ReferralGroupModel = z.infer<typeof postReferralGroupBody>;

export class ReferralGroupBuilder {
  private model: ReferralGroupModel = {
    id: 0,
    created: new Date().toISOString(),
    unique: crypto.randomUUID(),
    name: TEST_REFERRAL_GROUP_NAME,
    invalid: false,
    pages: [],
    customerJourneyScoring: [],
    personaScoring: [],
  };

  private createdId?: string;

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

  build(): ReferralGroupModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postReferralGroupBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postReferralGroup(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create referral group: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // post-referral-group honors whatever `unique` is supplied in the
    // request body rather than generating/overriding it server-side.
    this.createdId = response.data?.unique ?? validated.unique;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteReferralGroup(
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
      throw new Error("Referral group not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
