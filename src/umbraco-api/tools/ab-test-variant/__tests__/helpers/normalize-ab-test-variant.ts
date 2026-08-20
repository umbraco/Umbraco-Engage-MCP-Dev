const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// The server auto-generates each non-benchmark variant's default `segment`
// as `engage_ab-testing_<numeric variant id>` — the trailing number is the
// same per-run-random variant id already blanked elsewhere in the object, just
// embedded inside a string instead of its own field.
const AUTO_SEGMENT_REGEX = /^engage_ab-testing_\d+$/;

/**
 * Recursively blanks the identifier-shaped and date-shaped fields on a real,
 * persisted A/B test variant response that are per-run-random rather than
 * stable across test runs — its own numeric `id`, guid `unique`, foreign-key
 * `abTestId`, the `createdByUmbracoUserKey`/`disabledByUmbracoUserKey` guids,
 * the `created`/`disabled` datetimes, and the server-auto-generated `segment`
 * string.
 *
 * The SDK's own `createSnapshotResult` only blanks a shallow top-level `id`,
 * and the shared `normalizeVolatileFields` only covers `created`/
 * `createdByUmbracoUserKey`/`updatedByUmbracoUserKey` — neither reaches this
 * response's `unique`/`abTestId`/`disabled`/`disabledByUmbracoUserKey`/
 * `segment` fields, so this fills that gap.
 *
 * Deliberately a LOCAL duplicate of the sibling `ab-test` collection's own
 * `normalizeAbTestIdentifiers` (`ab-test/__tests__/helpers/normalize-ab-test.ts`),
 * trimmed to only the fields this collection's own flat variant responses
 * actually contain — this repo's convention is one-helper-per-collection
 * with no cross-collection imports.
 */
export function normalizeAbTestVariantIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeAbTestVariantIdentifiers);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === null || val === undefined) {
        out[key] = val;
        continue;
      }
      const isVolatileIdKey =
        key === "id" ||
        key === "unique" ||
        key.endsWith("Id") ||
        key.startsWith("createdBy") ||
        key.startsWith("disabledBy");
      const isDateKey = key === "created" || key === "disabled";
      if (isVolatileIdKey) {
        if (typeof val === "number") {
          out[key] = 0;
        } else if (typeof val === "string" && GUID_REGEX.test(val)) {
          out[key] = "00000000-0000-0000-0000-000000000000";
        } else {
          out[key] = val;
        }
      } else if (isDateKey) {
        out[key] = "NORMALIZED_DATE";
      } else if (key === "segment" && typeof val === "string" && AUTO_SEGMENT_REGEX.test(val)) {
        out[key] = "engage_ab-testing_NORMALIZED_ID";
      } else {
        out[key] = normalizeAbTestVariantIdentifiers(val);
      }
    }
    return out;
  }
  return value;
}
