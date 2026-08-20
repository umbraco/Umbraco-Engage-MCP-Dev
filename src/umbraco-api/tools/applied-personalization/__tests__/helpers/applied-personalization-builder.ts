import { randomUUID } from "crypto";
import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type {
  AppliedPersonalizationContentTypeDtoModel,
  AppliedPersonalizationTypeModel,
  AppliedPersonalizationUmbracoPageVariantDtoModel,
} from "../../../../api/generated/umbracoEngageManagementApi.js";

export const TEST_APPLIED_PERSONALIZATION_PREFIX = "_Test Applied Personalization";

interface AppliedPersonalizationModel {
  id: number;
  created: string;
  unique: string;
  type: AppliedPersonalizationTypeModel;
  isActive: boolean;
  pages: AppliedPersonalizationUmbracoPageVariantDtoModel[];
  contentTypes: AppliedPersonalizationContentTypeDtoModel[];
  name?: string | null;
  description?: string | null;
}

export class AppliedPersonalizationBuilder {
  private model: AppliedPersonalizationModel = {
    id: 0,
    created: new Date().toISOString(),
    // A fixed unique would collide with a real SQL unique-constraint on a
    // second test run — delete-applied-personalization is a soft delete and
    // never frees it up for reuse. Always generate a fresh one per create().
    unique: randomUUID(),
    type: "SinglePage",
    isActive: true,
    pages: [],
    contentTypes: [],
    name: TEST_APPLIED_PERSONALIZATION_PREFIX,
  };

  private createdUnique?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  withType(type: AppliedPersonalizationTypeModel): this {
    this.model.type = type;
    return this;
  }

  withIsActive(isActive: boolean): this {
    this.model.isActive = isActive;
    return this;
  }

  withPages(pages: AppliedPersonalizationUmbracoPageVariantDtoModel[]): this {
    this.model.pages = pages;
    return this;
  }

  withContentTypes(contentTypes: AppliedPersonalizationContentTypeDtoModel[]): this {
    this.model.contentTypes = contentTypes;
    return this;
  }

  build(): AppliedPersonalizationModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    // Always mint a fresh unique right before the API call — even if this
    // builder instance is reused across multiple create() calls.
    this.model.unique = randomUUID();

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postAppliedPersonalization(
      this.model,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create applied personalization: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    this.createdUnique = response.data?.unique ?? this.model.unique;
    return this;
  }

  async delete(): Promise<void> {
    if (this.createdUnique == null) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteAppliedPersonalization(
        { id: this.createdUnique },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    }
    this.createdUnique = undefined;
  }

  getId(): string {
    if (this.createdUnique == null) {
      throw new Error("Applied personalization not created yet. Call create() first.");
    }
    return this.createdUnique;
  }
}
