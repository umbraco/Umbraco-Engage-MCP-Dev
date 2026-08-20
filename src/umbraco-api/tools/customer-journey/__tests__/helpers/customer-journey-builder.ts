import { randomUUID } from "node:crypto";
import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postCustomerJourneyBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

export const TEST_CUSTOMER_JOURNEY_TITLE_PREFIX = "_Test Customer Journey";

type CustomerJourneyModel = z.infer<typeof postCustomerJourneyBody>;

export class CustomerJourneyBuilder {
  private model: CustomerJourneyModel = {
    id: 0,
    unique: randomUUID(),
    title: TEST_CUSTOMER_JOURNEY_TITLE_PREFIX,
    description: undefined,
    steps: [],
    minimumDeviationType: "Absolute",
    expirationType: "never",
  };

  // The server assigns its own `unique` on create and ignores whatever is
  // supplied in the request body — this stores that server-assigned value.
  private createdUnique?: string;

  withTitle(title: string): this {
    this.model.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  build(): CustomerJourneyModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postCustomerJourneyBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postCustomerJourney(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create customer journey: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    // The server assigns its own `unique` and does not honor the one
    // supplied in the request body — capture the real created unique from
    // the response's `journey.unique`, never from what we sent.
    const journey = response.data?.journey;
    if (!journey?.unique) {
      throw new Error(
        `Customer journey create response did not include journey.unique: ${JSON.stringify(response.data)}`,
      );
    }
    this.createdUnique = journey.unique;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteCustomerJourney(
        { id: this.createdUnique },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdUnique = undefined;
    }
  }

  getUnique(): string {
    if (!this.createdUnique) {
      throw new Error("Customer journey not created yet. Call create() first.");
    }
    return this.createdUnique;
  }
}
