import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export class CustomerJourneyBuilder {
  private createdUnique?: string;

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postCustomerJourney(
      {
        id: 0,
        unique: crypto.randomUUID(),
        steps: [],
      } as any,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create customer journey: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    this.createdUnique = response.data?.journey?.unique;
    return this;
  }

  getUnique(): string {
    if (!this.createdUnique) {
      throw new Error("Customer journey not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  async delete(): Promise<void> {
    if (!this.createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteCustomerJourney({ id: this.createdUnique } as any, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // ignore cleanup errors
    }
    this.createdUnique = undefined;
  }
}
