# Recipe: Personalization (Persona → Segment → Applied Personalization)

Based on `src/umbraco-api/tools/persona/__tests__/helpers/persona-builder.ts`,
`src/umbraco-api/tools/segments/__tests__/helpers/segments-builder.ts`, and
`src/umbraco-api/tools/applied-personalization/__tests__/helpers/applied-personalization-builder.ts`.

Personalization in Engage layers three independent concepts:

1. **Persona** — a scored visitor-behavior profile group (e.g. "Buyer Types" containing
   "Bargain Hunter"/"Loyal Customer").
2. **Segment** — a rule-based visitor bucket (e.g. "Returning visitors from Denmark").
3. **Applied personalization** — the actual content/css/js override, targeting either a
   segment or specific pages/content types.

Unlike the A/B test recipe, these three don't have a strict creation order dependency on
each other — a segment doesn't need a persona to exist, and an applied personalization only
needs a segment if you want to target one. Build whichever pieces the use case needs.

## 1. Create a persona group

A "Persona" resource is actually a **group** containing one or more individual personas in
its `personas` array:

```bash
<cli> --call post-persona --call-args '{
  "title": "Buyer Types",
  "personas": [
    { "title": "Bargain Hunter", "color": "#e63946" },
    { "title": "Loyal Customer", "color": "#457b9d" }
  ],
  "minimumParticipationScoreThreshold": 25,
  "minimumDeviationType": "Absolute",
  "minimumDeviation": 0,
  "expirationType": "never",
  "upperScoreLimit": 10
}'
```

This always creates a new group — there's no update-by-id form of this tool. Fetch details
afterward (each individual persona's own numeric sub-entity id, needed elsewhere e.g. in
`post-goal`'s `implicitPersonaScoring`, is NOT the group's own id):

```bash
<cli> --call get-persona-details --call-args '{"id":"<persona-group-unique-from-response>"}'
```

## 2. Create a segment

```bash
<cli> --call post-segments --call-args '{
  "name": "Returning Visitors - Denmark",
  "isTemporary": false,
  "sortOrder": 0,
  "controlGroupSize": 0,
  "rules": []
}'
```

Omit `id`/`unique` to create (rather than update) — the server assigns the numeric `id` and
honors any `unique` you supply, or generates one if omitted. `rules[]`'s exact `type`/`config`
shapes aren't documented upstream; the safest approach for an AI agent is to first call
`get-segments-all` against the target instance and copy the `type`/`config` shape from an
existing rule of the kind you need (e.g. geography, returning-visitor, referral-source),
rather than inventing one from scratch.

Capture both ids from the response — segment tools are inconsistent about which one they
want later:

- the guid `unique` — what `post-applied-personalization-segment`'s `segment` field expects
  is actually the segment's **alias/name string**, not either id (see step 3).
- the numeric `id` — what `post-segments-update-priority` needs to reorder segments.

## 3. Create the applied personalization

Pick a `type` based on what's being personalized, then target it at either a segment or
specific content:

```bash
<cli> --call post-applied-personalization --call-args '{
  "name": "Denmark Homepage Banner",
  "type": "SinglePage",
  "isActive": true,
  "segmentId": <numeric-id-from-step-2>,
  "pages": [{ "nodeId": <numeric-content-node-id>, "culture": null }],
  "contentTypes": []
}'
```

- `type` — one of the applied-personalization type values (`SinglePage`/`MultiPage`/
  `ContentType`, matching the same shape as `post-ab-test`'s `testType`); use `pages` for
  page-based types and `contentTypes` for `ContentType`.
- `segmentId` — target visitors matching a segment created in step 2 (its **numeric** id).
  Alternatively pass `umbracoSegmentAlias` to target a native Umbraco variant segment string
  instead of an Engage segment.
- `pages[].nodeId` / `contentTypes[].contentTypeId` — **numeric** ids, not guids. If you only
  have a page's guid (e.g. from `cms:create-document`, which returns the content node's
  `key`/unique guid), resolve the matching numeric legacy id via the chained CMS tools (check
  `cms:get-document`'s response shape on the target instance) before calling this tool — don't
  assume the guid can be passed directly here.

## Alternative: associate an existing applied personalization with a segment afterward

If the applied personalization already exists (created with `segmentId: null`), associate a
segment separately instead of recreating it:

```bash
<cli> --call post-applied-personalization-segment --call-args '{
  "unique": "<applied-personalization-unique>",
  "segment": "<segment-alias-or-name>"
}'
```

Note this tool's `segment` parameter is a **string alias/name**, not a guid — this is a
different identifier convention from `post-applied-personalization`'s own `segmentId` (a
numeric id). Response is `{ "created": boolean }` confirming whether the association was made.

## Locking a visitor's persona score

`post-persona-lock`/`post-persona-unlock` don't lock the persona group itself — they pin a
**specific visitor's** existing score assignment to one individual persona so automatic
scoring stops updating it for that visitor:

```bash
<cli> --call post-persona-lock --call-args '{
  "entityId": <individual-persona-sub-entity-id-from-get-persona-details>,
  "visitorId": <real-visitor-profile-id>
}'
<cli> --call post-persona-unlock --call-args '{
  "entityId": <individual-persona-sub-entity-id>,
  "visitorId": <real-visitor-profile-id>
}'
```

`entityId` is the individual persona's own sub-entity id (`personas[N].id` from
`get-persona-details`) — not the persona group's id. This requires a real visitor with
existing tracking history; a non-existent visitor/entity pair errors.
