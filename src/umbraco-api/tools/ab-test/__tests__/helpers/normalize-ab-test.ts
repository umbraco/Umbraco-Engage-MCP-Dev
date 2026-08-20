const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// The server auto-generates each non-benchmark variant's default `segment`
// as `engage_ab-testing_<numeric variant id>` — the trailing number is the
// same per-run-random variant id already blanked elsewhere in the tree, just
// embedded inside a string instead of its own field.
const AUTO_SEGMENT_REGEX = /^engage_ab-testing_\d+$/;

/**
 * Recursively blanks the identifier-shaped fields that are real but
 * per-run-random on a freshly built AbTestBuilder test — its own numeric
 * `id`, guid `unique`/`key`, foreign-key `*Id` fields (goalId, abTestId,
 * goalTypeId, projectId, ...), and `createdBy`/`updatedBy`/`disabledBy...`
 * guids on the embedded goal/variants.
 *
 * The SDK's own `createSnapshotResult` only normalizes a shallow top-level
 * `id` plus a fixed date-field list, and `normalizeVolatileFields` only
 * covers a specific named set (createdByUmbracoUserKey/Name, runId, ...) —
 * neither reaches the ab-test response's nested goal/variant identifiers, so
 * this fills that gap. Kept local to this collection's test helpers since
 * the "blank anything shaped like an id" heuristic is specific to how
 * verbose the ab-test payload's foreign keys are.
 */
export function normalizeAbTestIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeAbTestIdentifiers);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === null || val === undefined) {
        out[key] = val;
        continue;
      }
      const isVolatileKey =
        key === "id" ||
        key === "unique" ||
        key === "key" ||
        key.endsWith("Id") ||
        key.startsWith("createdBy") ||
        key.startsWith("updatedBy") ||
        key.startsWith("disabledBy");
      if (isVolatileKey) {
        if (typeof val === "number") {
          out[key] = 0;
        } else if (typeof val === "string" && GUID_REGEX.test(val)) {
          out[key] = "00000000-0000-0000-0000-000000000000";
        } else {
          out[key] = val;
        }
      } else if (key === "segment" && typeof val === "string" && AUTO_SEGMENT_REGEX.test(val)) {
        out[key] = "engage_ab-testing_NORMALIZED_ID";
      } else if (
        key === "variantStatus" &&
        typeof val === "object" &&
        !Array.isArray(val)
      ) {
        // `variantStatus` is a dictionary KEYED BY the per-run-random numeric
        // variant id (e.g. `{ "68": "Draft", "69": "Draft" }`) - unlike every
        // other volatile id in this payload, the id here is the object KEY,
        // not a named field, so the generic key-name check above can't reach
        // it. Re-key by ascending numeric order into stable placeholders
        // instead, preserving each variant's status and relative order.
        const entries = Object.entries(val as Record<string, unknown>).sort(
          (a, b) => Number(a[0]) - Number(b[0]),
        );
        const reKeyed: Record<string, unknown> = {};
        entries.forEach(([, status], index) => {
          reKeyed[`VARIANT_${index}`] = status;
        });
        out[key] = reKeyed;
      } else {
        out[key] = normalizeAbTestIdentifiers(val);
      }
    }
    return out;
  }
  return value;
}
