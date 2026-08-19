import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export const TEST_TRAFFIC_FILTER_NAME = "_Test Traffic Filter";

export class TrafficFilterBuilder {
  private createdKey?: string;

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postTrafficFilter(
      {
        id: 0,
        created: new Date().toISOString(),
        key: crypto.randomUUID(),
        name: TEST_TRAFFIC_FILTER_NAME,
        description: "test",
        type: "UserAgent",
        mode: "Block",
        condition: "Contains",
        value: "_TestAgent",
        values: ["_TestAgent"],
        isActive: true,
      } as any,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create traffic filter: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // Response is the bare key (uuid), not an object.
    this.createdKey = response.data;
    return this;
  }

  getKey(): string {
    if (!this.createdKey) {
      throw new Error("Traffic filter not created yet. Call create() first.");
    }
    return this.createdKey;
  }

  async delete(): Promise<void> {
    if (!this.createdKey) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteTrafficFilter({ key: this.createdKey } as any, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // ignore cleanup errors
    }
    this.createdKey = undefined;
  }
}
