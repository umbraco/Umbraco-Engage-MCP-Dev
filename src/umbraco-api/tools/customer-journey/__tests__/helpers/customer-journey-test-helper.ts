import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { TEST_CUSTOMER_JOURNEY_TITLE_PREFIX } from "./customer-journey-builder.js";

export class CustomerJourneyTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getCustomerJourneyAll(
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    // customInstance may return either HttpResponse<T> or T directly depending on
    // the underlying transport — handle both shapes.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  static async findByTitle(title: string): Promise<any | undefined> {
    const all = await this.listAll();
    return all.find((journey) => journey.title === title);
  }

  static async cleanup(
    titlePrefix: string = TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
  ): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();
    const toDelete = all.filter(
      (journey: any) =>
        typeof journey?.title === "string" && journey.title.startsWith(titlePrefix),
    );
    for (const journey of toDelete) {
      try {
        await client.deleteCustomerJourney(
          { id: journey.unique },
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
      for (const key of Object.keys(normalized)) {
        if (typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }
      return normalized;
    }

    return data;
  }
}
