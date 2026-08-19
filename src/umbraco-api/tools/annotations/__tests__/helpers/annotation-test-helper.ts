import { getUmbracoEngageManagementAPI } from "../../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { TEST_ANNOTATION_PREFIX } from "./annotation-builder.js";

export class AnnotationTestHelper {
  static async listAll(): Promise<any[]> {
    const client = getUmbracoEngageManagementAPI();
    const response: any = await client.getAnnotationsAll(
      undefined,
      CAPTURE_RAW_HTTP_RESPONSE,
    );
    // customInstance may return either HttpResponse<T> or T directly depending on
    // the underlying transport — handle both shapes.
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  static async findByDescription(description: string): Promise<any | undefined> {
    const all = await this.listAll();
    return all.find((a) => a.description === description);
  }

  static async cleanupTestAnnotations(): Promise<void> {
    const client = getUmbracoEngageManagementAPI();
    const all = await this.listAll();
    const toDelete = all.filter((a: any) =>
      typeof a?.description === "string" &&
      a.description.startsWith(TEST_ANNOTATION_PREFIX),
    );
    for (const a of toDelete) {
      try {
        await client.deleteAnnotations({ id: a.id }, CAPTURE_RAW_HTTP_RESPONSE);
      } catch {
        // ignore
      }
    }
  }

  static normalizeAnnotation(a: any): any {
    if (!a) return a;
    const { id: _id, created: _created, timestamp: _timestamp, ...rest } = a;
    return {
      id: 0,
      created: "1970-01-01T00:00:00.000Z",
      timestamp: "1970-01-01T00:00:00.000Z",
      ...rest,
    };
  }
}
