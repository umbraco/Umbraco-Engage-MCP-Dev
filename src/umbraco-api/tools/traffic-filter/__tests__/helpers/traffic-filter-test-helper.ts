import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export class TrafficFilterTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getTrafficFilterAll(CAPTURE_RAW_HTTP_RESPONSE);
    // customInstance may return either HttpResponse<T> or T directly depending on
    // the underlying transport — handle both shapes.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  static async findByName(name: string): Promise<any | undefined> {
    const all = await this.listAll();
    return all.find((f) => f.name === name);
  }

  /**
   * Delete all traffic filters whose name starts with the given prefix.
   * Delete is NOT idempotent for a missing key on this collection (a
   * non-existent key returns a real error), so failures are swallowed here —
   * this is best-effort cleanup, not a correctness check.
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();

    const toDelete = all.filter(
      (f: any) => typeof f?.name === "string" && f.name.startsWith(namePrefix),
    );

    for (const filter of toDelete) {
      try {
        await client.deleteTrafficFilter(
          { key: filter.key },
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
      if (normalized.key) {
        normalized.key = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.id) {
        normalized.id = 0;
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
