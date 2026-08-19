/**
 * Extracts a chained MCP tool's structured result, falling back to parsing
 * the legacy `content[].text` JSON when the tool has no outputSchema
 * (structuredContent is undefined in that case).
 */
export function extractChainedResult(result: {
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: unknown;
}): any {
  if (result.structuredContent !== undefined) {
    return result.structuredContent;
  }
  const text = result.content?.find((c) => c.type === "text")?.text;
  return text ? JSON.parse(text) : undefined;
}

/** Convenience for tools that return `{ id: string }` (e.g. create-document-type, create-document). */
export function extractId(result: {
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: unknown;
}): string | undefined {
  const data = extractChainedResult(result) as { id?: string } | undefined;
  return data?.id;
}
