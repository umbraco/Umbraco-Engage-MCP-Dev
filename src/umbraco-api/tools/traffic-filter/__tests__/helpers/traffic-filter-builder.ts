import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postTrafficFilterBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

export const TEST_TRAFFIC_FILTER_NAME = "_Test Traffic Filter";

type TrafficFilterModel = z.infer<typeof postTrafficFilterBody>;

export class TrafficFilterBuilder {
  private model: TrafficFilterModel = {
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
  };

  private createdKey?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  withKey(key: string): this {
    this.model.key = key;
    return this;
  }

  withType(type: string): this {
    this.model.type = type;
    return this;
  }

  withMode(mode: TrafficFilterModel["mode"]): this {
    this.model.mode = mode;
    return this;
  }

  withCondition(condition: string): this {
    this.model.condition = condition;
    return this;
  }

  withValue(value: string): this {
    this.model.value = value;
    return this;
  }

  withValues(values: string[]): this {
    this.model.values = values;
    return this;
  }

  withIsActive(isActive: boolean): this {
    this.model.isActive = isActive;
    return this;
  }

  build(): TrafficFilterModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postTrafficFilterBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postTrafficFilter(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create traffic filter: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // The create response is a BARE uuid string (the created key), not a JSON
    // object with a `.key`/`.unique` property.
    this.createdKey = response.data ?? validated.key;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdKey) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteTrafficFilter(
        { key: this.createdKey },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdKey = undefined;
    }
  }

  getKey(): string {
    if (!this.createdKey) {
      throw new Error("Traffic filter not created yet. Call create() first.");
    }
    return this.createdKey;
  }
}
