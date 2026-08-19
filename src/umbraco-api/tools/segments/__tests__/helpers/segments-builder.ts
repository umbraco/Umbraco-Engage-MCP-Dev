import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export class SegmentsBuilder {
  private unique = crypto.randomUUID();

  getUnique(): string {
    return this.unique;
  }

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postSegments(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: this.unique,
        isTemporary: false,
        sortOrder: 0,
        rules: [],
        controlGroupSize: 0,
      } as any,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create segment: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    return this;
  }

  async delete(): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteSegments({ id: this.unique } as any, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // ignore cleanup errors
    }
  }
}
