import { mcpClientManager } from "../umbraco-api/mcp-client.js";
import { extractId } from "./chained-tool-result.js";

/**
 * Creates and tears down a real, published Umbraco content page via the
 * chained CMS MCP server (create-document-type -> create-document ->
 * publish-document), for collections whose real entities need a genuine
 * content node to reference (e.g. ab-test's umbracoPageVariants, or
 * content-scoring's documentUnique).
 *
 * Empirically confirmed: create-document's returned `id` is the content
 * node's Umbraco key/unique guid - there is no separate "key" field, so
 * getId()/getKey() return the same value.
 *
 * Requires the REAL chained CMS server (not USE_MOCK_MCP_CHAIN=true) - the
 * mock only implements get-server-info/echo-message.
 */
export class ContentPageFixture {
  private documentTypeId?: string;
  private documentId?: string;

  async create(): Promise<this> {
    const alias = "testFixtureRoot" + Date.now();

    const docTypeResult = await mcpClientManager.callTool("cms", "create-document-type", {
      name: "_Test Fixture Root",
      alias,
      icon: "icon-home",
      allowedAsRoot: true,
    });
    if (docTypeResult.isError) {
      throw new Error(
        `Failed to create test document type: ${JSON.stringify(docTypeResult.content)}`,
      );
    }
    const documentTypeId = extractId(docTypeResult);
    if (!documentTypeId) {
      throw new Error(`create-document-type did not return an id: ${JSON.stringify(docTypeResult)}`);
    }
    this.documentTypeId = documentTypeId;

    const docResult = await mcpClientManager.callTool("cms", "create-document", {
      documentTypeId,
      name: "_Test Fixture Page",
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

  /** The content node's Umbraco key/unique guid (same value as getId()). */
  getKey(): string {
    return this.getId();
  }

  getId(): string {
    if (!this.documentId) {
      throw new Error("Content page not created yet. Call create() first.");
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

// The chained CMS MCP is spawned as a child process on first use - close it
// so Jest doesn't hang on an open handle after the test file finishes.
export async function disconnectChainedCms(): Promise<void> {
  await mcpClientManager.disconnectAll();
}
