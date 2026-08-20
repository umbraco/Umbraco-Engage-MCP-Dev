import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { postSegmentsBody } from "../../../../api/generated/umbracoEngageManagementApi.zod.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import type { z } from "zod";

export const TEST_SEGMENT_NAME_PREFIX = "_Test Segment";

type SegmentModel = z.infer<typeof postSegmentsBody>;

export class SegmentsBuilder {
  private model: SegmentModel = {
    id: 0,
    created: new Date().toISOString(),
    unique: crypto.randomUUID(),
    name: TEST_SEGMENT_NAME_PREFIX,
    isTemporary: false,
    sortOrder: 0,
    rules: [],
    controlGroupSize: 0,
  };

  // The `unique` supplied in the request body is honored verbatim by the
  // API, but the response's top-level `id` is a separate, real numeric
  // internal id required by post-segments-update-priority. Both are
  // captured from the raw response before any snapshot normalization runs.
  private createdUnique?: string;
  private createdNumericId?: number;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  withUnique(unique: string): this {
    this.model.unique = unique;
    return this;
  }

  withSortOrder(sortOrder: number): this {
    this.model.sortOrder = sortOrder;
    return this;
  }

  withControlGroupSize(controlGroupSize: number): this {
    this.model.controlGroupSize = controlGroupSize;
    return this;
  }

  withIsTemporary(isTemporary: boolean): this {
    this.model.isTemporary = isTemporary;
    return this;
  }

  build(): SegmentModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const validated = postSegmentsBody.parse(this.model);

    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postSegments(
      validated,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create segment: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    // post-segments honors whatever `unique` is supplied in the request
    // body rather than generating/overriding it server-side.
    this.createdUnique = response.data?.unique ?? validated.unique;
    this.createdNumericId = response.data?.id;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdUnique) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteSegments(
        { id: this.createdUnique },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    } finally {
      this.createdUnique = undefined;
      this.createdNumericId = undefined;
    }
  }

  getId(): string {
    if (!this.createdUnique) {
      throw new Error("Segment not created yet. Call create() first.");
    }
    return this.createdUnique;
  }

  getNumericId(): number {
    if (this.createdNumericId == null) {
      throw new Error("Segment not created yet. Call create() first.");
    }
    return this.createdNumericId;
  }
}
