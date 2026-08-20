import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { TEST_CAMPAIGN_GROUP_PREFIX } from "./campaign-group-builder.js";

export class CampaignGroupTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getCampaignGroupAll(
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    // customInstance may return either HttpResponse<T> or T directly depending on
    // the underlying transport — handle both shapes.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  static async findByName(name: string): Promise<any | undefined> {
    const all = await this.listAll();
    return all.find((item: any) => item.name === name);
  }

  static async cleanup(namePrefix: string = TEST_CAMPAIGN_GROUP_PREFIX): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();
    const toDelete = all.filter(
      (item: any) =>
        typeof item?.name === "string" && item.name.startsWith(namePrefix),
    );
    for (const item of toDelete) {
      try {
        await client.deleteCampaignGroup(
          { id: item.unique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
    }
  }

  static normalizeIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: any = { ...data };
      if (typeof normalized.id === "number") {
        normalized.id = 0;
      }
      if (typeof normalized.unique === "string") {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      if (typeof normalized.created === "string") {
        normalized.created = "1970-01-01T00:00:00.000Z";
      }
      for (const key of Object.keys(normalized)) {
        if (normalized[key] && typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }
      return normalized;
    }

    return data;
  }
}
