import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export class AppliedPersonalizationBuilder {
  private unique = crypto.randomUUID();

  getUnique(): string {
    return this.unique;
  }

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postAppliedPersonalization(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: this.unique,
        type: "SinglePage",
        isActive: true,
        pages: [],
        contentTypes: [],
      } as any,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create applied personalization: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    return this;
  }

  async delete(): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteAppliedPersonalization(
        { id: this.unique } as any,
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    }
  }
}
