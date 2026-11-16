/**
 * Minimum Umbraco Engage version
 *
 * The Engage Management API changes within a major (see CLAUDE.md), so this
 * line's tools only work fully on `MIN_ENGAGE_VERSION` and later. Raise it
 * whenever an alignment with a newer Engage release changes the API, and
 * re-derive `VERSION_SENSITIVE_TOOLS` from that alignment's tools/list diff.
 */

/** Oldest Umbraco Engage release this line's tools are generated against. */
export const MIN_ENGAGE_VERSION = "18.2.0";

/**
 * Tools whose inputSchema or outputSchema changed when the Umbraco 17 line was
 * aligned with Engage 17.5.0 (the full tools/list diff of that alignment;
 * Engage 17.5.0 brought the 17.x Management API in line with 18.2.0). On an
 * older Engage these fail with schema errors or, worse, silently drop fields
 * (e.g. `post-applied-personalization`'s `segmentKey`), so they refuse to run
 * there. The same set is used on the Umbraco 17 and 18 lines.
 */
export const VERSION_SENSITIVE_TOOLS: ReadonlySet<string> = new Set([
  "get-ab-test",
  "get-ab-test-all",
  "get-ab-test-empty",
  "get-ab-test-project",
  "get-ab-test-project-all",
  "get-ab-test-variant",
  "get-ab-test-variant-all",
  "get-ab-test-variant-segment",
  "get-ab-test-view-model",
  "get-applied-personalization-all",
  "get-applied-personalization-id",
  "get-applied-personalization-segment",
  "get-configuration",
  "get-content-types-segmented-property",
  "get-data-cleanup-last-run",
  "get-heatmaps-variants",
  "get-suspicious-activity-overview",
  "post-ab-test",
  "post-ab-test-project",
  "post-ab-test-runtime-indication",
  "post-ab-test-segment",
  "post-ab-test-start",
  "post-ab-test-stop",
  "post-ab-test-variant",
  "post-ab-test-variant-create",
  "post-ab-test-variant-details",
  "post-ab-test-variant-disable",
  "post-analytics-query",
  "post-applied-personalization",
  "post-applied-personalization-segment",
  "put-ab-test-project",
]);

export interface EngageVersion {
  major: number;
  minor: number;
  patch: number;
  /** Prerelease tag (`rc1` in `17.5.0-rc1`), or null for a release. */
  prerelease: string | null;
  /** The version without its `+build` suffix, e.g. `17.2.1`. */
  text: string;
}

const VERSION_PATTERN = /^v?(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/;

/**
 * Parses an Engage version such as `17.2.1+cb3108d` or `17.5.0-rc1`.
 * The `+build` suffix is ignored. Returns null for anything else.
 */
export function parseEngageVersion(value: unknown): EngageVersion | null {
  if (typeof value !== "string") return null;
  const match = VERSION_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, major, minor, patch = "0", prerelease = null] = match;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease,
    text: `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ""}`,
  };
}

/**
 * Compares two parsed versions: negative when `a` is older, 0 when equal,
 * positive when newer. A prerelease sorts below its release.
 */
export function compareEngageVersions(a: EngageVersion, b: EngageVersion): number {
  for (const key of ["major", "minor", "patch"] as const) {
    if (a[key] !== b[key]) return a[key] - b[key];
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  return a.prerelease.localeCompare(b.prerelease, "en", { numeric: true });
}

/**
 * Whether `found` is older than `minimum`. Returns null when either can't be
 * parsed, so callers can fail open.
 */
export function isEngageVersionBelow(found: unknown, minimum: string = MIN_ENGAGE_VERSION): boolean | null {
  const a = parseEngageVersion(found);
  const b = parseEngageVersion(minimum);
  if (!a || !b) return null;
  return compareEngageVersions(a, b) < 0;
}
