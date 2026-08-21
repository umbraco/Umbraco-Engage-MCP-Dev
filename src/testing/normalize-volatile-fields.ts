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
// `created`/`updated` are in the SDK's own DATE_FIELDS list, but that
// normalization is shallow (top-level structuredContent keys only) — a
// nested `created` several levels deep (e.g. inside an array item's
// sub-object) is missed and needs this recursive pass instead.
const DATE_LIKE_FIELDS = [
  "started",
  "finished",
  "lastGenerated",
  "createdOn",
  "updatedOn",
  "created",
  "updated",
];
const DURATION_FIELDS = ["durationMs", "totalDurationMs"];
const GUID_LIKE_FIELDS = ["runId", "icon"];
const MACHINE_LOCAL_FIELDS = ["reportingTimeZone"];
// Umbraco generates a random short folder hash per media item
// (e.g. /media/eoliknpp/journey-speaker.png) - differs on every fresh
// install of the package-seeded default media, never reproducible.
const MEDIA_URL_FIELDS = ["iconUrl"];
// Set at install time by whichever account performed the install/seed
// migration — permanent for a given database, but never reproducible across
// a different environment's install (a fresh demo-site, a CI container).
const INSTALL_IDENTITY_FIELDS = ["createdByUmbracoUserName"];
// GUID identifiers of the *calling* Umbraco user (as opposed to a display
// name) — varies per environment's API user, same category as
// INSTALL_IDENTITY_FIELDS but a GUID rather than a string.
const USER_KEY_FIELDS = ["createdByUmbracoUserKey", "updatedByUmbracoUserKey"];

export function normalizeVolatileFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeVolatileFields);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Nullable volatile fields (e.g. updatedOn/updatedByUmbracoUserKey
      // before anything has updated the record) should stay null/undefined
      // rather than be replaced with a placeholder — null is itself a
      // meaningful, reproducible value.
      if (val === null || val === undefined) {
        out[key] = val;
      } else if (DATE_LIKE_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_DATE";
      } else if (DURATION_FIELDS.includes(key)) {
        out[key] = 0;
      } else if (GUID_LIKE_FIELDS.includes(key)) {
        out[key] = "00000000-0000-0000-0000-000000000000";
      } else if (USER_KEY_FIELDS.includes(key)) {
        out[key] = "00000000-0000-0000-0000-000000000000";
      } else if (MACHINE_LOCAL_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_TIMEZONE";
      } else if (MEDIA_URL_FIELDS.includes(key)) {
        out[key] = "NORMALIZED_MEDIA_URL";
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
