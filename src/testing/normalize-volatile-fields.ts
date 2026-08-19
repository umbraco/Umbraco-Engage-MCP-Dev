/**
 * Recursively blanks fields that are inherently non-deterministic across
 * runs/machines/CI and aren't covered by the SDK's own createSnapshotResult
 * normalization (which only handles GUID-shaped `id` fields and a fixed list
 * of date field names — created, createDate, publishDate, etc.).
 *
 * Use this for snapshot tests whose data includes background-job run
 * timestamps/durations/run ids, or machine-local values like a reporting
 * timezone — none of which will ever match a checked-in snapshot value
 * captured on a different machine or at a different moment in time.
 */
const DATE_LIKE_FIELDS = ["started", "finished", "lastGenerated"];
const DURATION_FIELDS = ["durationMs", "totalDurationMs"];
const GUID_LIKE_FIELDS = ["runId"];
const MACHINE_LOCAL_FIELDS = ["reportingTimeZone"];
// Set at install time by whichever account performed the install/seed
// migration — permanent for a given database, but never reproducible across
// a different environment's install (a fresh demo-site, a CI container).
const INSTALL_IDENTITY_FIELDS = ["createdByUmbracoUserName"];

export function normalizeVolatileFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeVolatileFields);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (DATE_LIKE_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_DATE";
      } else if (DURATION_FIELDS.includes(key)) {
        out[key] = 0;
      } else if (GUID_LIKE_FIELDS.includes(key)) {
        out[key] = "00000000-0000-0000-0000-000000000000";
      } else if (MACHINE_LOCAL_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_TIMEZONE";
      } else if (INSTALL_IDENTITY_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_USER";
      } else {
        out[key] = normalizeVolatileFields(val);
      }
    }
    return out;
  }
  return value;
}
