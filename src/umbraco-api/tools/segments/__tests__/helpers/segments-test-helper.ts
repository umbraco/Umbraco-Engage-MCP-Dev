import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { TEST_SEGMENT_NAME_PREFIX } from "./segments-builder.js";

export class SegmentsTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getSegmentsAll(
      undefined,
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
    return all.find((s) => s.name === name);
  }

  /**
   * Clean up test segments by name prefix. Best-effort — failures are
   * swallowed since this is cleanup, not a correctness check.
   */
  static async cleanup(namePrefix: string = TEST_SEGMENT_NAME_PREFIX): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();

    const toDelete = all.filter(
      (s: any) => typeof s?.name === "string" && s.name.startsWith(namePrefix),
    );

    for (const segment of toDelete) {
      try {
        await client.deleteSegments(
          { id: segment.unique },
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
      if (normalized.unique) {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.id != null) {
        normalized.id = 0;
      }
      if (normalized.segmentId != null) {
        normalized.segmentId = 0;
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
