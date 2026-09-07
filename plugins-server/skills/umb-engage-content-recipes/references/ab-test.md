# Recipe: A/B Test

Based on `src/umbraco-api/tools/ab-test/__tests__/helpers/ab-test-builder.ts` and
`src/umbraco-api/tools/ab-test-variant/__tests__/helpers/ab-test-fixture.ts`.

A single-page A/B test needs, in order: a real published content page, a real goal (with a
real goal type), then the test itself. A project and a second variant/page are optional
extras layered on top.

## 1. (Optional) Create an A/B test project to group tests under

```bash
<cli> --call post-ab-test-project --call-args '{
  "name": "Homepage Q1 Experiments",
  "description": "Homepage Q1 Experiments"
}'
```

Capture the response's numeric `id` (not `unique`) — that's what `post-ab-test`'s `projectId`
field expects. Omitting this step is fine; the test is still fully usable via
`get-ab-test-all`/`get-ab-test`, it just won't show up when browsing by project.

## 2. Create a real, published content page

```bash
<cli> --call cms:create-document-type --call-args '{
  "name":"Landing Page","alias":"landingPage","icon":"icon-home","allowedAsRoot":true
}'
# → capture documentTypeId from the response

<cli> --call cms:create-document --call-args '{
  "documentTypeId":"<documentTypeId>","name":"Homepage","values":[]
}'
# → capture documentId (this IS the content node's unique/key guid)

<cli> --call cms:publish-document --call-args '{
  "id":"<documentId>","data":{"publishSchedules":[]}
}'
```

If a suitable published page already exists, use `cms:search-document` instead of creating
a new one.

## 3. Find a real goal type

```bash
<cli> --call get-goal-all-types --call-args '{}'
```

Find the entry whose `configurationEditorAlias` is `"CustomGoal"` and capture its `id`. Do
**not** use an all-zero placeholder guid here — it persists the goal fine in step 4 but fails
step 5's validation with "The selected goal should be active and valid".

## 4. Create the goal

```bash
<cli> --call post-goal --call-args '{
  "name": "Homepage Signup",
  "value": 1,
  "goalTypeId": "<customGoalTypeId-from-step-3>",
  "goalTypeConfig": "{}",
  "isMain": false,
  "isInverted": false,
  "isActive": true,
  "isInvalid": false,
  "isImplicitScoringEnabled": false,
  "implicitPersonaScoring": [],
  "implicitCustomerJourneyStepScoring": []
}'
```

Capture the response's `unique` guid.

## 5. Resolve the goal's numeric id

```bash
<cli> --call get-goal-details --call-args '{"id":"<goal-unique-from-step-4>"}'
```

Capture the response's numeric `id` — `post-ab-test`'s `goalId` field wants this, not the
guid from step 4.

## 6. Create the A/B test

```bash
<cli> --call post-ab-test --call-args '{
  "name": "Homepage Signup CTA Test",
  "testType": "SinglePage",
  "goalId": <numeric-id-from-step-5>,
  "goal": {
    "key": "<goal-unique-from-step-4>",
    "name": "Homepage Signup",
    "value": 1,
    "goalTypeId": "<customGoalTypeId-from-step-3>",
    "goalTypeConfig": "{}",
    "isMain": false,
    "isInverted": false,
    "isActive": true,
    "isInvalid": false
  },
  "pageUnique": "<documentId-from-step-2>",
  "projectId": <numeric-id-from-step-1-if-used>,
  "secondVariantName": "Variant B",
  "participationPercentage": 1,
  "minimumDetectableEffect": 0.1,
  "estimatedDailyVisitors": 0,
  "baselineConversionRate": 0.05
}'
```

`goalId` and the embedded `goal` object **must describe the same real goal** — the server
validates the `goal` object independently, so a mismatch fails validation even though
`goalId` alone is correct. A `goalId` that doesn't correspond to any real goal at all fails
as a raw 500 (a database foreign-key violation), not a clean validation message — always
resolve it from a real goal first (steps 4–5), never invent a number.

The response includes `validationResults: { isValid, warnings, errors }` — check
`isValid` before treating the test as successfully created; a `200` response can still
carry `isValid: false`.

The test is created in **Draft** status — there is no status field to set directly.

## 7. (Variant) Add a second variant directly, or use a SplitUrl test

`post-ab-test` above already creates two variants ("Original" + the named second variant) for
`SinglePage`/`MultiPage`/`ContentType` tests. To add further variants to an existing test:

```bash
<cli> --call post-ab-test-variant-create --call-args '{
  "testId": <numeric-test-id-from-step-6-response>
}'
```

The response already contains the new variant's full record (numeric `id`, `unique`,
`abTestId`, `created`, `createdByUmbracoUserKey`, `totalPageviewsForVariant`, etc.) — the
server generated it, so nothing needs to be looked up separately. `post-ab-test-variant`
updates it afterwards (e.g. to rename it), but it's a **full replace, not a partial patch**:
copy every field from the create response verbatim and only change the one(s) you intend,
or you'll zero out fields like `totalPageviewsForVariant`. If you're updating a variant
you *didn't* just create, fetch its current values first with `get-ab-test-variant`
(numeric `id`, not `unique`) instead:

```bash
<cli> --call post-ab-test-variant --call-args '{
  "id": <numeric-id-from-create-response>,
  "unique": "<unique-from-create-response>",
  "abTestId": <numeric-test-id-from-step-6>,
  "name": "Variant C",
  "description": null,
  "redirectNodeKey": null,
  "css": null,
  "javascript": null,
  "created": "<created-from-create-response>",
  "createdByUmbracoUserKey": "<createdByUmbracoUserKey-from-create-response>",
  "isBenchmark": false,
  "disabled": null,
  "disabledByUmbracoUserKey": null,
  "isDisabled": false,
  "segment": null,
  "totalPageviewsForVariant": 0,
  "totalVisitorsForVariant": 0
}'
```

For a **SplitUrl** test (each variant redirects to its own distinct page instead of showing
variants on one page), pass `"testType": "SplitUrl"` in step 6 and additionally supply
`secondVariantPageUnique` — a second real published page's unique guid, created the same way
as step 2. Omitting it is rejected with "At least two pages should be configured"; supplying
it for any other `testType` is rejected up front.

## 8. Start the test

```bash
<cli> --call post-ab-test-start --call-args '{
  "unique": "<test-unique-from-step-6-response>",
  "pageUnique": "<documentId-from-step-2>"
}'
```

`pageUnique` (and `secondVariantPageUnique` for SplitUrl tests) must be **resupplied** here —
the tool can't reliably read back the test's existing page configuration, so resubmitting
without it would wipe it. Omit `startTime` to start immediately, or pass a future ISO
datetime to schedule it (status becomes `Scheduled` until then). Calling this again before
the test is stopped reschedules it.

## 9. Stop the test

```bash
<cli> --call post-ab-test-stop --call-args '{
  "unique": "<test-unique>",
  "pageUnique": "<documentId-from-step-2>"
}'
```

`pageUnique` (and `secondVariantPageUnique` for SplitUrl tests) must be resupplied here too,
for the same reason as step 8. Omit `endTime` to stop immediately; pass `isCompleted: true`
if this is a natural completion rather than a manual halt — both stop serving variants the
same way, this only changes the computed status label (`Completed` vs `Stopped`).

There is no resume — Engage has no "restart a stopped test" feature; `post-ab-test-start`
rejects that case explicitly. Create a new test instead.
