# Recipe: Standalone Goals

Based on `src/umbraco-api/tools/goal/__tests__/helpers/goal-builder.ts`.

A goal on its own (not attached to an A/B test) is used for campaign/conversion tracking and
implicit persona/customer-journey scoring. It's simpler than the A/B test recipe because
`post-goal` doesn't validate the goal type as strictly at creation time — but any goal you
intend to later attach to an A/B test should still use a real goal type (see the note below).

## 1. Find a goal type

```bash
<cli> --call get-goal-all-types --call-args '{}'
```

Returns the available goal types (e.g. page-visit goals, custom goals). Look for
`configurationEditorAlias: "CustomGoal"` for a generic, freeform goal, or another entry if
the goal should be tied to a specific built-in type (e.g. tracking a specific page visit).

**If this goal will ever be referenced by `post-ab-test`'s `goalId`**, you must use a real
type id here — `post-ab-test` rejects a goal created with an all-zero placeholder
`goalTypeId` even though `post-goal` itself accepts it. See the `ab-test.md` recipe.

## 2. Create the goal

```bash
<cli> --call post-goal --call-args '{
  "name": "Newsletter Signup",
  "value": 1,
  "goalTypeId": "<goalTypeId-from-step-1>",
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

- `value` — the goal's weight/value when computing scoring.
- `isMain` — whether this is a site's primary/headline goal.
- `isInverted` — invert the goal's success semantics (e.g. for a goal that tracks something
  undesirable, like a bounce).
- `isImplicitScoringEnabled` + `implicitPersonaScoring`/`implicitCustomerJourneyStepScoring` —
  opt into automatically scoring personas/customer-journey steps when this goal fires. Each
  scoring rule needs real numeric ids (`personaId`, the persona's segment sub-entity
  `entityId` from `get-persona-details` — not the persona group's own id — and `nodeId`);
  leave both arrays empty for a plain conversion goal with no automatic scoring.

The response is just `{ "unique": "<guid>" }`. There is no numeric id in this response —
call `get-goal-details` with that `unique` afterward if you need the numeric id (e.g. to
attach it to an A/B test).

## Listing and inspecting goals

```bash
# All goals with their main-goal flags
<cli> --call get-goals-main --call-args '{}'
<cli> --call get-goals-all --call-args '{}'

# Full details of one goal, including its resolved numeric id
<cli> --call get-goal-details --call-args '{"id":"<goal-unique>"}'
```

## No delete endpoint

There is no `delete-goal` tool — goals persist permanently once created (the Engage
Management API has no delete-goal endpoint at all, confirmed by this repo's own tests, which
fall back to a direct SQL sweep in CI rather than a tool call). For throwaway/demo goals,
prefer a distinctive, greppable name and set `isActive: false` to retire it instead of
expecting to remove it.

## Campaigns and campaign groups

`campaigns`/`campaign-group` tools surface reporting on visits/scoring already computed from
goals and traffic — there's no separate "create a campaign" content structure to build here;
a campaign is identified by UTM parameters on real traffic. Use `get-campaigns` /
`get-campaign-group-all` to inspect existing campaign data once goals are in place and
traffic has occurred.
