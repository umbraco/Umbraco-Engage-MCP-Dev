/**
 * Engage Version Guard
 *
 * At startup, reads the installed Umbraco Engage version (the endpoint
 * `get-package` uses) and compares it with `MIN_ENGAGE_VERSION`. On an older
 * Engage, every call to a version-sensitive tool returns an error naming the
 * required version; all other tools are untouched. The check fails open: if
 * the version can't be read in time, nothing is blocked.
 */

import {
  UmbracoManagementClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  MIN_ENGAGE_VERSION,
  VERSION_SENSITIVE_TOOLS,
  parseEngageVersion,
  compareEngageVersions,
} from "./engage-version.js";

/** Endpoint `get-package` reads; its `version` is e.g. `18.2.0+1aa412a`. */
export const ENGAGE_PACKAGE_PATH = "/umbraco/engage/management/api/v1/package";

/** Deadline for the startup version lookup, token request included. */
export const DEFAULT_ENGAGE_VERSION_TIMEOUT_MS = 5000;

export type EngageVersionStatus =
  | { state: "supported"; version: string; minimum: string }
  | { state: "too-old"; version: string; minimum: string }
  | { state: "unknown"; reason: string };

/** Status used when the check doesn't run (no client credentials). */
export const ENGAGE_VERSION_NOT_CHECKED: EngageVersionStatus = {
  state: "unknown",
  reason: "not checked (no client credentials)",
};

export interface CheckEngageVersionOptions {
  /** Returns the raw Engage version string; must honour `signal`. */
  readVersion: (signal: AbortSignal) => Promise<unknown>;
  minimum?: string;
  timeoutMs?: number;
  /** Where the one-line warning goes (stderr by default; stdout is the MCP channel). */
  log?: (line: string) => void;
}

/**
 * Reads the installed Engage version under a deadline and classifies it.
 * Never throws: a failed, slow or unparseable lookup gives `unknown`.
 */
export async function checkEngageVersion(options: CheckEngageVersionOptions): Promise<EngageVersionStatus> {
  const {
    readVersion,
    minimum = MIN_ENGAGE_VERSION,
    timeoutMs = DEFAULT_ENGAGE_VERSION_TIMEOUT_MS,
    log = (line) => console.error(line),
  } = options;

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let status: EngageVersionStatus;
  try {
    const lookup = readVersion(controller.signal);
    lookup.catch(() => undefined); // a late rejection after the deadline must not go unhandled
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        // Settle the deadline first so the timeout, not the abort, is reported.
        reject(new Error(`no response within ${timeoutMs}ms`));
        controller.abort();
      }, timeoutMs);
    });
    const raw = await Promise.race([lookup, deadline]);
    const found = parseEngageVersion(raw);
    const required = parseEngageVersion(minimum);
    if (!found || !required) {
      status = { state: "unknown", reason: `unrecognised version ${JSON.stringify(raw ?? null)}` };
    } else if (compareEngageVersions(found, required) < 0) {
      status = { state: "too-old", version: found.text, minimum: required.text };
    } else {
      status = { state: "supported", version: found.text, minimum: required.text };
    }
  } catch (error) {
    status = { state: "unknown", reason: error instanceof Error ? error.message : String(error) };
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (status.state === "unknown") {
    log(`[engage-version] Could not check the Umbraco Engage version (${status.reason}); version-sensitive tools are not blocked.`);
  } else if (status.state === "too-old") {
    log(`[engage-version] ${engageVersionWarning(status)}`);
  }
  return status;
}

/** Reads the installed Engage version through the SDK's authenticated client. */
export async function readInstalledEngageVersion(signal: AbortSignal): Promise<unknown> {
  const response = (await UmbracoManagementClient<{ version?: string | null }>(
    { url: ENGAGE_PACKAGE_PATH, method: "GET" },
    { ...CAPTURE_RAW_HTTP_RESPONSE, signal },
  )) as unknown as HttpResponse<{ version?: string | null }>;
  if (response?.status >= 400) {
    throw new Error(`HTTP ${response.status} from ${ENGAGE_PACKAGE_PATH}`);
  }
  return response?.data?.version;
}

/** Warning for stderr and the server `instructions`; null unless Engage is too old. */
export function engageVersionWarning(status: EngageVersionStatus): string | null {
  if (status.state !== "too-old") return null;
  return (
    `Umbraco Engage ${status.version} is older than ${status.minimum}, which this MCP server needs. ` +
    `Its A/B test, personalization, analytics query and related tools return an error until ` +
    `Umbraco Engage is upgraded to ${status.minimum} or later; other tools work as usual.`
  );
}

/** The error a blocked tool returns. */
export function engageVersionToolError(status: { version: string; minimum: string }): string {
  return (
    `Umbraco Engage ${status.version} is older than ${status.minimum}, which this tool needs. ` +
    `Upgrade Umbraco Engage to ${status.minimum} or later.`
  );
}

/**
 * The handler to register for `tool`: the tool's own handler, unless Engage
 * is too old and the tool is version-sensitive, in which case every call
 * returns an `isError` result instead (so no request reaches Engage).
 */
export function guardVersionSensitiveHandler<H>(
  tool: { name: string; handler: H },
  status: EngageVersionStatus,
  sensitiveTools: ReadonlySet<string> = VERSION_SENSITIVE_TOOLS,
): H {
  if (status.state !== "too-old" || !sensitiveTools.has(tool.name)) {
    return tool.handler;
  }
  const message = engageVersionToolError(status);
  const blocked = async (): Promise<CallToolResult> => ({
    isError: true,
    content: [{ type: "text", text: message }],
  });
  return blocked as unknown as H;
}
