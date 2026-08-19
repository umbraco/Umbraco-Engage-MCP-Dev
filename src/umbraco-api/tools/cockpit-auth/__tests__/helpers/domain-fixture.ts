import { mcpClientManager } from "../../../../mcp-client.js";
import { extractId } from "../../../../../testing/chained-tool-result.js";

// Seeds/tears down a published content node with a registered domain via the
// chained CMS MCP server so get-cockpit-auth-domains has real domain data to
// list against a fresh, otherwise-empty demo-site.
export const TEST_DOMAIN_NAME = "https://localhost:44448";
export const TEST_DOMAIN_ISO_CODE = "en-US";

export class DomainFixture {
  private documentTypeId?: string;
  private documentId?: string;

  async create(): Promise<this> {
    const docTypeResult = await mcpClientManager.callTool("cms", "create-document-type", {
      name: "Test Cockpit Domain Root",
      alias: "testCockpitDomainRoot",
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
      name: "Test Cockpit Domain Root",
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

    const domainResult = await mcpClientManager.callTool("cms", "put-document-domains", {
      id: documentId,
      data: {
        defaultIsoCode: TEST_DOMAIN_ISO_CODE,
        domains: [{ domainName: TEST_DOMAIN_NAME, isoCode: TEST_DOMAIN_ISO_CODE }],
      },
    });
    if (domainResult.isError) {
      throw new Error(`Failed to assign test domain: ${JSON.stringify(domainResult.content)}`);
    }

    return this;
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

// The chained CMS MCP is spawned as a child process on first use — close it
// so Jest doesn't hang on an open handle after the test file finishes.
export async function disconnectChainedCms(): Promise<void> {
  await mcpClientManager.disconnectAll();
}
