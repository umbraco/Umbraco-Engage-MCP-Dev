import { mcpClientManager } from "../../../../mcp-client.js";
import { extractId } from "../../../../../testing/chained-tool-result.js";

// Seeds/tears down a document type via the chained CMS MCP server so
// get-content-types-all has real content-type data to list against a
// fresh, otherwise-empty demo-site.
export const TEST_CONTENT_TYPE_NAME = "Test Content Base";
export const TEST_CONTENT_TYPE_ALIAS = "testContentBase";

export class DocumentTypeFixture {
  private documentTypeId?: string;

  async create(): Promise<this> {
    const result = await mcpClientManager.callTool("cms", "create-document-type", {
      name: TEST_CONTENT_TYPE_NAME,
      alias: TEST_CONTENT_TYPE_ALIAS,
      icon: "icon-document",
      allowedAsRoot: true,
    });
    if (result.isError) {
      throw new Error(
        `Failed to create test document type via chained CMS MCP: ${JSON.stringify(result.content)}`,
      );
    }
    const id = extractId(result);
    if (!id) {
      throw new Error(
        `create-document-type did not return an id: ${JSON.stringify(result)}`,
      );
    }
    this.documentTypeId = id;
    return this;
  }

  getId(): string {
    if (!this.documentTypeId) {
      throw new Error("Document type not created yet. Call create() first.");
    }
    return this.documentTypeId;
  }

  async delete(): Promise<void> {
    if (!this.documentTypeId) return;
    try {
      await mcpClientManager.callTool("cms", "delete-document-type", {
        id: this.documentTypeId,
      });
    } catch {
      // ignore cleanup errors
    }
    this.documentTypeId = undefined;
  }
}

// The chained CMS MCP is spawned as a child process on first use — close it
// so Jest doesn't hang on an open handle after the test file finishes.
export async function disconnectChainedCms(): Promise<void> {
  await mcpClientManager.disconnectAll();
}
