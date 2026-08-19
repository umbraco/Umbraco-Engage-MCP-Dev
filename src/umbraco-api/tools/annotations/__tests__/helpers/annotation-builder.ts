import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";

export const TEST_ANNOTATION_PREFIX = "_Test Annotation";

interface AnnotationModel {
  id: number;
  created: string;
  timestamp: string;
  description: string;
  createdByUserName: string;
  visibility: "Always" | "Node" | "NodeAndDescendants" | "Created" | "Published" | "AbTestStart" | "AbTestEnd";
  invalid: boolean;
  pageVariants: { unique: string; culture?: string | null }[];
}

export class AnnotationBuilder {
  private model: AnnotationModel = {
    id: 0,
    created: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    description: TEST_ANNOTATION_PREFIX,
    createdByUserName: "_test",
    visibility: "Always",
    invalid: false,
    pageVariants: [],
  };

  private createdId?: number;

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  withVisibility(visibility: AnnotationModel["visibility"]): this {
    this.model.visibility = visibility;
    return this;
  }

  build(): AnnotationModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.postAnnotations(
      this.model,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    if (response.status >= 400) {
      throw new Error(
        `Failed to create annotation: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }
    this.createdId = response.data?.id;
    return this;
  }

  async delete(): Promise<void> {
    if (this.createdId == null) return;
    const client = getUmbracoEngageManagementAPI();
    try {
      await client.deleteAnnotations(
        { id: this.createdId },
        CAPTURE_RAW_HTTP_RESPONSE,
      );
    } catch {
      // ignore cleanup errors
    }
    this.createdId = undefined;
  }

  getId(): number {
    if (this.createdId == null) {
      throw new Error("Annotation not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
