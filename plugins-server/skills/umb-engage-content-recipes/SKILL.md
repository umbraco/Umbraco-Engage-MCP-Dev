---
name: umb-engage-content-recipes
description: Reference recipes for building real Umbraco Engage content structures through the MCP tools — A/B tests (project, goal, test, variant, start/stop), goals used standalone for campaign scoring, and personalization (persona, segment, applied personalization). Use when the user wants to create/set up an A/B test, a goal, a persona, a segment, or personalization rules via the Engage MCP tools, or wants to understand the required tool call order and field dependencies.
---

# Umbraco Engage — Content Structure Recipes

Several Engage entities can't be created with one isolated tool call: the Management API validates cross-references between real, already-persisted entities (a goal must be real and active before an A/B test can reference it; an A/B test needs a real published content page). Calling the "obvious" tool first with placeholder ids fails validation or, worse, a raw 500 from a broken foreign key.

These recipes give the exact, empirically-verified tool call order for each structure, based on this repo's own integration test builders (`src/umbraco-api/tools/*/__tests__/helpers/*-builder.ts`) — those builders create genuinely persisted entities against a real Umbraco instance in CI, so the sequences here are proven to work, not just plausible.

All examples assume the `umb-engage-dev-cli` skill's `<cli>` placeholder and CMS chaining enabled (the default) — content pages are created via the `cms:`-prefixed tools proxied from the chained CMS MCP server.

## Recipes

- **[A/B test](references/ab-test.md)** — project (optional) → goal → content page → A/B test → variant → start/stop. The most dependency-heavy structure in this server.
- **[Goals for campaigns/scoring](references/goals-and-campaigns.md)** — creating a standalone goal, and where goal type ids come from.
- **[Personalization](references/personalization.md)** — persona → segment → applied personalization, targeting either a segment or specific pages/content types.

## Shared Gotchas

- **`goalTypeId` must be a real type, not an all-zero placeholder guid.** `post-goal` will happily persist a goal with `"00000000-0000-0000-0000-000000000000"`, but `post-ab-test` then rejects that goal with "The selected goal should be active and valid". Always fetch real ids from `get-goal-all-types` first — look for the entry with `configurationEditorAlias: "CustomGoal"` for a generic custom goal.
- **Guid vs numeric id confusion is the most common failure mode.** Several tools return/accept a `unique` guid in one place and a numeric `id` in another for the *same* entity (goals, segments, A/B test projects). Read each tool's field description before assuming which one it wants — `--describe-tool` is faster than a failed call.
- **No delete endpoint exists for goals.** There is no `delete-goal` tool anywhere in the Engage Management API. Test/demo goals accumulate; the repo's own test suite works around this with a SQL sweep (`goal/__tests__/helpers/sql-cleanup.ts`) that isn't available outside this repo — in a real environment, prefer distinctive, greppable names for throwaway goals so they're easy to find and archive/deactivate later (`isActive: false`) instead of expecting to delete them.
- **Content pages must be real and published.** `pageUnique` (A/B test) and `nodeId` (applied personalization pages) both need a genuinely existing, published Umbraco content node — create one via the chained `cms:create-document-type` → `cms:create-document` → `cms:publish-document` sequence if there isn't a suitable existing page, rather than inventing a guid.
