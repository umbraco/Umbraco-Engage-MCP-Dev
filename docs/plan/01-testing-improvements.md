# Stage 1 — Testing Improvements

Ordered roughly by leverage (biggest pain removed per unit of effort first).

## 1. Adopt `cms-dev-mcp`'s demo-site provisioning pattern

This session hand-built `demo-site/` from scratch: wrote `demo-site.csproj`/`Program.cs`/`appsettings*.json` by hand, spun up a SQL Server container in Docker, manually created the target database via `sqlcmd`, and manually ran `dotnet dev-certs https --trust` (which needed a macOS Keychain prompt approved by a human). None of that is necessary — `umbraco-mcp-dev-cms` already solved it:

- **`demo-site-template/`** — a tracked template project (csproj, `Program.cs`, `appsettings.json`, composers) that is the actual source of truth, copied into the gitignored `demo-site/` by a script rather than hand-authored per checkout.
- **`scripts/bootstrap-demo-site.sh`** — `rsync`s the template in (idempotent; `--force` to reset), and critically supports a **`--sqlite` flag** that writes a zero-dependency SQLite connection string instead of a SQL Server one:
  ```
  "umbracoDbDSN": "Data Source=|DataDirectory|/Umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True"
  ```
  This alone removes the Docker + SQL Server dependency entirely — a new contributor (or a fresh agent session) could go from clone to running demo-site with no external services.

**Action:** `bootstrap-demo-site.sh` itself is generic and portable as-is (full content in [Recent Changes §D](03-recent-changes.md#d-scriptsbootstrap-demo-sitesh)). `demo-site-template/` needs real adaptation, not a verbatim copy — `cms-dev-mcp`'s currently targets `Umbraco.Cms 18.0.0`, incompatible with `Umbraco.Engage 17.2.1`'s `[17.2.0, 18.0.0)` dependency range (see [Recent Changes §E](03-recent-changes.md#e-demo-site-template--needs-adapting-not-copying-verbatim) for the specific diffs needed). Update `scripts/start-umbraco.sh` (currently a stub that just errors) to actually call the ported bootstrap script.

## 2. Rewrite the eval tests against real tool names — done

`tests/evals/example-crud.test.ts` and `tests/evals/tool-filtering.test.ts` referenced `get-example`, `create-example`, `get-widget`, `create-widget`, etc. — tools that never existed anywhere in this project's 37 collections, unmodified copies from the generic SDK template scaffold. `mcp-chaining.test.ts` was already fine (tests the real `get-chained-info` delegation pattern).

**Done:** `example-crud.test.ts` renamed to `ab-test-project-crud.test.ts` and rewritten as a real create/list/update/delete flow against `post-ab-test-project`/`get-ab-test-project-all`/`put-ab-test-project`/`delete-ab-test-project`. `tool-filtering.test.ts`'s 12 tests rewritten against `ab-test-project` (full read/list/create/update/delete) and `document-type-permissions` (read/list/create only) — chosen because their slices and mode membership (`ab-testing` vs `administration`) don't overlap. All 3 files (14 tests) pass against the real instance; the CRUD test's fixture was verified deleted via direct SQL check afterward.

## 2a. Fix the eval harness crash — done; root cause was the SDK version after all

Every eval test crashed before reaching tool logic:
```
TypeError: Object not disposable
  at ... node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs
```
**Correcting an earlier claim in this doc**: this *was* a `@anthropic-ai/claude-agent-sdk` version issue, despite `package.json` declaring the same `^0.2.39` range as `umbraco-mcp-dev-cms` (whose evals work). The caret let it drift to an actually-installed `0.2.141`, while `umbraco-mcp-dev-cms` pins the version exactly (no caret) and has `0.2.39` installed — the two projects' *declared* ranges matched, but their *installed* versions didn't. Verified by temporarily reinstalling `0.2.39` (`npm install @anthropic-ai/claude-agent-sdk@0.2.39 --no-save`): the crash disappeared entirely and every eval file ran real agent calls successfully. **Fix applied**: `package.json` now pins `"@anthropic-ai/claude-agent-sdk": "0.2.39"` exactly, matching `umbraco-mcp-dev-cms`.

A second, unrelated fix was needed to make the harness actually useful: `tests/evals/helpers/e2e-setup.ts` set `USE_MOCK_API: "true"`, but `src/umbraco-api/api/client.ts`'s mock mode only understands a leftover template `/item` CRUD shape and 404s on every real Engage endpoint — every tool-calling eval would have failed regardless of the SDK fix. Evals now run against the real Umbraco+Engage instance (same one integration tests use), matching `umbraco-mcp-dev-cms`'s own working setup — see item 2 above.

## 3. Add CI

This repo has no `.github/` directory — zero CI. `umbraco-mcp-dev-cms`'s `test.yml` is the template: compile → build → `dotnet dev-certs https --trust` → bootstrap demo-site (with `--sqlite`, so no service containers needed) → boot Umbraco with a status-poll wait loop → create the API user via `scripts/create-api-user.mjs` → `npm test` → (separately) Playwright e2e. A second `evals` job, gated to release PRs targeting `main` with `ANTHROPIC_API_KEY` from repo secrets, runs the eval suite only where it's worth the cost.

**Action:** port `test.yml` — full breakdown of both its jobs, including the `serverStatus`-polling boot-wait pattern worth adopting independently of everything else, in [Recent Changes §F](03-recent-changes.md#f-githubworkflowstestyml). Use this project's own `scripts/create-api-user.mjs` (already fixed for this Umbraco version's Swagger redirect URI — `cms-dev-mcp`'s own copy still has the old, broken one; don't port theirs). Add `.github/dependabot.yml` ([Recent Changes §G](03-recent-changes.md#g-githubdependabotyml)) for npm/actions security-update rollups — decide on a `target-branch` first, since this project has no `dev` branch yet.

## 4. Integration test coverage is critically low — mutation tools especially

The "48 passing test suites" headline elsewhere in this plan measures *tests that exist*, not *coverage*. Measured directly against the actual tool files (not estimated), before and after this priority was acted on:

| | At session start | After closing all `delete-*` gaps | After closing all `post`/`put` gaps |
|---|---|---|---|
| Total tool files | 146 | 146 | 146 |
| Tool files never imported by any test | 99 (68%) | 84 (58%) | **46 (32%)** |
| Total mutation tool files (`post`/`put`/`delete`) | 56 | 56 | 56 |
| Mutation tool files with **zero** test coverage of any kind | 52 (93%) | 37 (66%) | **0 (0%)** |
| Mutation tool files with a test that imports and calls the **tool handler itself** | 4 (7%) | 19 (34%) | **56 (100%)** |

**Status: items 1 and 2 below are done — every mutation tool (`post`/`put`/`delete`, 56 total) in the project now has a test that calls its own handler.** Only item 3 (the remaining 46 `get` tools) is still open.

The 4 that were already properly covered at session start (`post-analytics-query`, `post-cockpit-delete-cookie`, `post-cockpit-auth-generate-token`, `post-heatmaps-generate-scroll-heatmap`) were, not coincidentally, the low-risk ones — a query, a cookie delete, a token generation, a heatmap render. It's important to be precise about *why* the rest were missed even where a fixture already existed: the 3 fixture builders added earlier this session (`AbTestProjectBuilder`, `DocumentTypeFixture`, `DomainFixture`) create/delete data by calling the **raw Orval API client directly** or the **chained CMS MCP** — neither path invokes this project's own tool handler. Seeding fixture data and testing a tool are two different things. The 15 new delete-tool tests all call the tool's own `handler` directly, closing that gap for every `delete-*` tool specifically.

**Action — prioritize by risk, not by convenience:**
1. ~~**First**: every `delete-*` tool (14 total)~~ — **done.** All 14 now have a test calling the tool's own handler (`ab-test-project`, `ab-test`, `ab-test-variant`, `annotations`, `applied-personalization`, `campaign-group`, `content-scoring` ×2, `customer-journey`, `persona`, `referral-group`, `segments` ×2, `traffic-filter`). See [Session Changelog](04-session-changelog.md) for the new builders and real-API-behavior findings this surfaced (server-overridden `unique` fields on `persona`/`customer-journey`, a segment-name-prefix business rule on `delete-segments-delete-segment-content`, `ab-test` requiring a real goal+page+variant to actually persist).
2. ~~**Second**: the `post`/`put` tools for entities other tools *read* elsewhere in the suite~~ — **done.** Every remaining `post`/`put` tool across all 37 collections now has a test calling its own handler — including simple parameterless tools (`main-switch`, `page-data`), read-only POST-as-query endpoints (`goal`/`referral-scoring`/`profile`), and the hard cases with real dependency chains (`ab-test`, `ab-test-variant`, `content-scoring`), tested via the "documented real behavior" pattern rather than forcing an expensive happy path. See the bullet list below for the specific product bugs and FK/no-FK behaviors this surfaced.
3. **Now the priority**: the remaining read-only (`get`) tools that also have zero coverage — lower risk than mutations, but 46 `get` tools still have none tested. Several collections (`profile` has 12, `ab-test` has 5, `campaign-group` has 3) account for most of the gap; see the full list in the coverage table's underlying file scan.

Follow the two established fixture sub-patterns when building out coverage further (see [Session Changelog §Fixture builders](04-session-changelog.md#fixture-builders-for-integration-tests) for the original two, and the 9 new builders added closing out item 1 for more examples):
- **Engage-native entities** (A/B tests, personas, segments, …): call `getUmbracoEngageManagementAPI()` directly in a builder for setup/teardown. **Probe the real API empirically before assuming behavior** — this session found real, inconsistent quirks across entities: `persona`/`customer-journey` silently discard the client-supplied `unique` and assign their own (capture it from the response instead); `ab-test-project`/`campaign-group`/`referral-group`/`segments` honor the client-supplied `unique` as-is; delete idempotency on a non-existent id varies per entity (`annotations`/most others succeed silently, `ab-test-project`/`traffic-filter` return a real error) — don't assume, verify each one and assert the actual behavior.
- **CMS-native entities** the Engage tools only *read* (content types, documents, domains): use `mcpClientManager.callTool("cms", toolName, args)` — see `content-types/__tests__/helpers/document-type-fixture.ts` and `cockpit-auth/__tests__/helpers/domain-fixture.ts` for the pattern, including the `content[].text` fallback for chained tools without an `outputSchema`.
- **When an entity is too expensive to persist for what you're testing** (e.g. `ab-test` requires an existing goal, a configured page, and a second variant just to pass server-side validation and actually save) — don't force it. Test the tool's real, reliably-reproducible behavior instead (see `ab-test/__tests__/delete-ab-test.test.ts` and the two `content-scoring` delete tests, which document *why* a full happy-path isn't covered rather than faking one).
- **Some entities have no delete endpoint at all** (`goal`, the page-data analytics endpoints, `user-group-permissions`) — every test run against them permanently adds a row with no API-level cleanup. Accepted for this instance (the database is periodically recycled), but be deliberate: don't snapshot exact row counts/contents for a `get-all` sibling of one of these (see `post-goal-all.test.ts`), since the count grows on every subsequent run instead of staying fixed.
- **Real product bug found in `post-permissions-user-group`**: it's insert-only (never an upsert) and writes asynchronously. Calling it against a `userGroupKey` that already has a stored row creates a *second* row for that key — the real Engage server's `GetAll()` does `rows.ToDictionary(x => x.userGroupKey)` with no duplicate handling, so a second row for an existing key permanently crashes `get-permissions-user-group-all` (500: "An item with the same key has already been added") for every caller, not just the offending test. This was hit for real during this session and required a targeted `DELETE` against the demo database's `umbracoEngageSettingsUserGroupPermission` table to recover — there's no API-level fix available since there's no delete endpoint for this resource either. Worth reporting upstream to the Engage team. The test now only ever uses a fresh, never-before-seen `userGroupKey` so it can never collide with a real group's row. `post-permissions-document-type` (sibling collection) applies the same fresh-id mitigation preemptively without re-discovering the crash.
- **FK-protected inserts are safe to probe with a fake id; not-FK-protected ones aren't** — check `sys.foreign_keys` before assuming either way, don't guess. `post-ab-test-variant`/`post-ab-test-variant-create` (real FK to `umbracoEngageAbTestingAbTest`) and `post-content-scoring-save`'s persona path (real FK to `umbracoEngagePersonalizationPersona`, but silently no-ops instead of erroring for a bad id — verified via the table directly) both cleanly reject a non-existent parent id with zero rows written either way. `post-permissions-user-group`/`post-permissions-document-type` above have **no FK at all**, which is exactly why a bad call there persists garbage instead of failing loudly.
- **Raw SQL error bodies aren't snapshot-safe**: a few tools (e.g. `post-ab-test-variant` against a bad `abTestId`) return the full .NET exception text as `structuredContent`, which embeds a per-request bearer token and SQL connection id — both change every run. Assert a stable substring (`toContain("FOREIGN KEY constraint")`) instead of snapshotting the whole string.

`umbraco-mcp-dev-cms` has **29** `__tests__/helpers/` directories to this project's now-11 (up from 1 before this session, 4 after the fixture-builder work, 11 after closing the delete-tool gap — not every delete tool needed a new builder: `ab-test-variant`, `ab-test`, and both `content-scoring` tools test real, reliably-reproducible behavior directly rather than through a fixture). That gap is real, but it's a symptom of the coverage problem above, not the problem itself — more helpers without more tests calling actual tool handlers won't move the numbers in the table above; only item 2 will.

## 5. Keep extending `normalizeVolatileFields`, don't hand-patch with `-u`

This session found and fixed a real trap: several tests were "passing" only because their snapshots had just been regenerated with `jest -u`, while the underlying values (job timestamps, durations, run ids, machine timezone, install-identity strings) are inherently non-reproducible and will drift again on the very next run — including in CI on a different container. The fix was a shared, extensible helper (`src/testing/normalize-volatile-fields.ts`), not one-off snapshot updates.

**Action:** when a new test flakes on re-run for the same reason, add the field name to the appropriate list in `normalize-volatile-fields.ts` rather than running `-u` and moving on. If `umbraco-mcp-dev-cms`'s inline per-test patches (e.g. `user-test-helper.ts`) are ever ported here, consider consolidating them into this shared helper too — it's already more DRY than that pattern.

## 6. Consider whether the MSW mock-API layer is worth keeping

`src/mocks/` (MSW handlers, `USE_MOCK_API`) exists in this project but `umbraco-mcp-dev-cms` has no equivalent at all — its tests always hit a real Umbraco instance. Every fix made this session went through the real API; the mock layer wasn't exercised. Either it's dead weight worth removing, or it has a real purpose (e.g. fast unit-level tests without a live instance) that should be demonstrated with at least one test using it — currently unclear which.

## 7. Adopt the Jest infrastructure this project is missing

Fully specified with copyable content in [Recent Changes §A/B/C](03-recent-changes.md#a-jestsetup-after-envts--global-snapshot-path-normalizer):
- **`jest.setup-after-env.ts`** — a snapshot serializer that strips machine-specific filesystem paths from *any* snapshot automatically, no per-test opt-in. Complementary to `normalizeVolatileFields()` (§5 above), not a replacement — that handles job-data fields, this handles path leakage.
- **`jest-failure-reporter.ts`** — writes `test-failures.log` after any failing run, paired with a `test:rerun-failures` npm script. Would have sped up this session's repeated full-suite reruns.
- **`test:one` (with `--forceExit`)** — this session hit exactly the failure mode this guards against (an open TLS handle / chained-MCP child process keeping Jest from exiting).
- **`umbraco:stop`** — a one-line port-kill script. This session repeatedly killed the demo-site process by hand across restarts; this would have saved that every time.

## 8. Add `scripts/test-changed.mjs`

Git-diff-aware `jest --findRelatedTests` pre-flight for fast local iteration — fully specified in [Recent Changes §H](03-recent-changes.md#h-scriptstest-changedmjs). Portable as-is; its branch-fallback chain already degrades gracefully to `main` for a repo (like this one, today) with no `dev` branch yet.

## 9. Nice-to-haves from `cms-dev-mcp` not yet assessed for priority

- `scripts/worktree-create.sh` / `worktree-remove.sh` — parallel-worktree dev support.
- `tests/e2e-sdk/` — a third test tier this project has no equivalent of; assess whether Engage needs one or whether integration + hosted-e2e is sufficient coverage.
