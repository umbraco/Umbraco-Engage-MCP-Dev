import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { TEST_APPLIED_PERSONALIZATION_PREFIX } from "./applied-personalization-builder.js";

export class AppliedPersonalizationTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getAppliedPersonalizationAll(
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
    return all.find((a) => a.name === name);
  }

  static async cleanup(namePrefix: string = TEST_APPLIED_PERSONALIZATION_PREFIX): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();
    const toDelete = all.filter(
      (a: any) => typeof a?.name === "string" && a.name.startsWith(namePrefix),
    );
    for (const a of toDelete) {
      try {
        await client.deleteAppliedPersonalization(
          { id: a.unique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Normalizes fields that are never reproducible across runs — `id` and
   * `umbracoSegmentAlias` are both derived from a site-wide auto-increment
   * counter, and `unique` is a freshly minted GUID per create() call.
   */
  static normalizeIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = { ...data };
      if ("id" in normalized) {
        normalized.id = 0;
      }
      if ("unique" in normalized) {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      if ("umbracoSegmentAlias" in normalized) {
        normalized.umbracoSegmentAlias = "NORMALIZED_SEGMENT_ALIAS";
      }
      for (const key of Object.keys(normalized)) {
        const value = normalized[key];
        if (value && typeof value === "object") {
          normalized[key] = this.normalizeIds(value);
        }
      }
      return normalized;
    }

    return data;
  }
}
