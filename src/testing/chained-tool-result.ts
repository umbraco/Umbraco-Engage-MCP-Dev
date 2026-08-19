import { extractChainedResult } from "@umbraco-cms/mcp-server-sdk";

export { extractChainedResult };

/** Convenience for tools that return `{ id: string }` (e.g. create-document-type, create-document). */
export function extractId(result: {
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: unknown;
}): string | undefined {
  const data = extractChainedResult(result) as { id?: string } | undefined;
  return data?.id;
}
