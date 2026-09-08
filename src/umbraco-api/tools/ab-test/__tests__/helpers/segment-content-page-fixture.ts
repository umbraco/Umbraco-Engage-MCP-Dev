import { mcpClientManager } from "../../../../mcp-client.js";
import { extractId, extractChainedResult } from "../../../../../testing/chained-tool-result.js";

interface DocumentTypeProperty {
  id: string;
  variesBySegment: boolean;
  [key: string]: unknown;
}

interface DocumentTypeBody {
  id: string;
  properties: DocumentTypeProperty[];
  [key: string]: unknown;
}

/**
 * Builds a real, published Umbraco content page whose document type has
 * segment variation enabled (a segment-varying property) - the one
 * requirement `post-ab-test-segment`'s real server (confirmed by decompiling
 * Umbraco.Engage.Web.dll) actually cares about.
 *
 * create-document-type hardcodes `variesBySegment: false` (see
 * https://github.com/umbraco/Umbraco-CMS-MCP-Dev/issues/429), so this goes
 * through the two-step workaround confirmed to work end-to-end: create a
 * plain document type, then a follow-up update-document-type call with
 * `variesBySegment: true` on the type AND its property (the full
 * generated body schema DOES expose this field, create's flattened schema
 * just doesn't).
 */
export class SegmentContentPageFixture {
  private documentTypeId?: string;
  private documentId?: string;

  async create(): Promise<this> {
    const alias = "testSegmentRoot" + Date.now();

    const textstringResult = await mcpClientManager.callTool("cms", "find-data-type", {
      query: "Textstring",
    });
    const textstring = (
      extractChainedResult(textstringResult) as { items: { id: string; name: string }[] }
    ).items.find((item) => item.name === "Textstring");
    if (!textstring) {
      throw new Error(`Could not find the built-in "Textstring" data type: ${JSON.stringify(textstringResult)}`);
    }

    const docTypeResult = await mcpClientManager.callTool("cms", "create-document-type", {
      name: "_Test Segment Root",
      alias,
      icon: "icon-home",
      allowedAsRoot: true,
      properties: [{ name: "Body", alias: "body", dataTypeId: textstring.id, tab: "Content" }],
    });
    if (docTypeResult.isError) {
      throw new Error(`Failed to create test document type: ${JSON.stringify(docTypeResult.content)}`);
    }
    const documentTypeId = extractId(docTypeResult);
    if (!documentTypeId) {
      throw new Error(`create-document-type did not return an id: ${JSON.stringify(docTypeResult)}`);
    }
    this.documentTypeId = documentTypeId;

    // create-document-type can't set variesBySegment itself - flip it on via
    // a follow-up update-document-type call instead (needs the full body).
    const fullTypeResult = await mcpClientManager.callTool("cms", "get-document-type-by-id", {
      id: documentTypeId,
    });
    if (fullTypeResult.isError) {
      throw new Error(`Failed to fetch created document type: ${JSON.stringify(fullTypeResult.content)}`);
    }
    const fullType = extractChainedResult(fullTypeResult) as DocumentTypeBody;

    const updateResult = await mcpClientManager.callTool("cms", "update-document-type", {
      id: documentTypeId,
      data: {
        ...fullType,
        variesBySegment: true,
        properties: fullType.properties.map((property) => ({
          ...property,
          variesBySegment: true,
        })),
      },
    });
    if (updateResult.isError) {
      throw new Error(`Failed to enable segment variation: ${JSON.stringify(updateResult.content)}`);
    }

    const docResult = await mcpClientManager.callTool("cms", "create-document", {
      documentTypeId,
      name: "_Test Segment Page",
      values: [],
    });
    if (docResult.isError) {
      throw new Error(`Failed to create test document: ${JSON.stringify(docResult.content)}`);
    }
    const documentId = extractId(docResult);
    if (!documentId) {
      throw new Error(`create-document did not return an id: ${JSON.stringify(docResult)}`);
    }
    this.documentId = documentId;

    const publishResult = await mcpClientManager.callTool("cms", "publish-document", {
      id: documentId,
      data: { publishSchedules: [] },
    });
    if (publishResult.isError) {
      throw new Error(`Failed to publish test document: ${JSON.stringify(publishResult.content)}`);
    }

    return this;
  }

  /** The real, published segment-varying content page's unique guid. */
  getPageKey(): string {
    if (!this.documentId) {
      throw new Error("Segment content page not created yet. Call create() first.");
    }
    return this.documentId;
  }

  async delete(): Promise<void> {
    if (this.documentId) {
      try {
        await mcpClientManager.callTool("cms", "delete-document", { id: this.documentId });
      } catch {
        // ignore cleanup errors
      }
      this.documentId = undefined;
    }
    if (this.documentTypeId) {
      try {
        await mcpClientManager.callTool("cms", "delete-document-type", { id: this.documentTypeId });
      } catch {
        // ignore cleanup errors
      }
      this.documentTypeId = undefined;
    }
  }
}
