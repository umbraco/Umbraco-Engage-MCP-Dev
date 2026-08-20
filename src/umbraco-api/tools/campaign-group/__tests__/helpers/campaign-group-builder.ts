import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postCampaignGroupBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { randomUUID } from "node:crypto";
import type { z } from "zod";

export const TEST_CAMPAIGN_GROUP_PREFIX = "_Test Campaign Group";

type CampaignGroupModel = z.infer<typeof postCampaignGroupBody>;

export class CampaignGroupBuilder {
  private model: CampaignGroupModel = {
    id: 0,
    created: new Date().toISOString(),
    unique: randomUUID(),
    name: TEST_CAMPAIGN_GROUP_PREFIX,
    description: undefined,
    invalid: false,
    campaigns: [],
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

  build(): CampaignGroupModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postCampaignGroupBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postCampaignGroup(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create campaign group: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // post-campaign-group honors whatever `unique` is supplied in the
    // request body rather than generating/overriding it server-side.
    this.createdId = response.data?.unique ?? validated.unique;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteCampaignGroup(
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
      throw new Error("Campaign group not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
