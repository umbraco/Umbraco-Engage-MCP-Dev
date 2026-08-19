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

## 2. Rewrite the eval tests against real tool names

Confirmed this session: `tests/evals/example-crud.test.ts` and `tests/evals/tool-filtering.test.ts` reference `get-example`, `create-example`, `get-widget`, `create-widget`, etc. — tools that do not exist anywhere in this project's 37 collections. They're unmodified copies from the generic SDK template scaffold, never adapted. Only `mcp-chaining.test.ts` tests something real (the `get-chained-info` delegation pattern), and even that exercises the generic mechanism rather than an Engage-specific scenario.

`umbraco-mcp-dev-cms` has **16 real eval files** (`create-data-type`, `create-document-type`, `member-management`, `schema-driven-content-creation`, etc.), each verified against actual tool names in that project. That's the bar to match.

**Action:**
- Rewrite `example-crud.test.ts` into something like `ab-test-project-crud.test.ts`: create an A/B test project, list it, update it, delete it — using the real `post-ab-test-project`/`get-ab-test-project-all`/`put-ab-test-project`/`delete-ab-test-project` tools.
- Rewrite `tool-filtering.test.ts`'s assertions to use real Engage tool/collection/mode names (e.g. `UMBRACO_TOOL_MODES=ab-testing`, `UMBRACO_INCLUDE_SLICES=read`) instead of `example`/`example-2`.
- Keep `mcp-chaining.test.ts` as-is — it's testing the SDK mechanism, which is legitimately generic.

## 2a. Fix the eval harness crash (blocks the above until done — see Upgrades §1)

Running any eval test in this environment currently crashes before reaching tool logic:
```
TypeError: Object not disposable
  at ... node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs
```
**This is not a `@anthropic-ai/claude-agent-sdk` version issue** — verified `umbraco-mcp-dev-cms` pins the exact same `0.2.39` and its evals work. The cause is something specific to this project's eval setup or environment, not the dependency. Diff `tests/evals/helpers/e2e-setup.ts` against `umbraco-mcp-dev-cms`'s equivalent before touching anything else — see [Upgrades §1](02-upgrades.md#1-anthropic-aiclaude-agent-sdk--investigate-dont-just-bump) for the correction and [Recent Changes §Corrections](03-recent-changes.md#corrections-to-the-earlier-structural-pass-readmemd--02-upgradesmd) for how this was verified.

## 3. Add CI

This repo has no `.github/` directory — zero CI. `umbraco-mcp-dev-cms`'s `test.yml` is the template: compile → build → `dotnet dev-certs https --trust` → bootstrap demo-site (with `--sqlite`, so no service containers needed) → boot Umbraco with a status-poll wait loop → create the API user via `scripts/create-api-user.mjs` → `npm test` → (separately) Playwright e2e. A second `evals` job, gated to release PRs targeting `main` with `ANTHROPIC_API_KEY` from repo secrets, runs the eval suite only where it's worth the cost.

**Action:** port `test.yml` — full breakdown of both its jobs, including the `serverStatus`-polling boot-wait pattern worth adopting independently of everything else, in [Recent Changes §F](03-recent-changes.md#f-githubworkflowstestyml). Use this project's own `scripts/create-api-user.mjs` (already fixed for this Umbraco version's Swagger redirect URI — `cms-dev-mcp`'s own copy still has the old, broken one; don't port theirs). Add `.github/dependabot.yml` ([Recent Changes §G](03-recent-changes.md#g-githubdependabotyml)) for npm/actions security-update rollups — decide on a `target-branch` first, since this project has no `dev` branch yet.

## 4. Integration test coverage is critically low — mutation tools especially

The "48 passing test suites" headline elsewhere in this plan measures *tests that exist*, not *coverage*. Measured directly against the actual tool files this session (not estimated):

| | Count | % |
|---|---|---|
| Total tool files | 146 | — |
| Tool files never imported by any test | **99** | **68%** |
| Total mutation tool files (`post`/`put`/`delete`) | 56 | — |
| Mutation tool files with **zero** test coverage of any kind | **52** | **93%** |
| Mutation tool files with a test that imports and calls the **tool handler itself** | **4** | **7%** |

The 4 that are properly covered (`post-analytics-query`, `post-cockpit-delete-cookie`, `post-cockpit-auth-generate-token`, `post-heatmaps-generate-scroll-heatmap`) are, not coincidentally, the low-risk ones — a query, a cookie delete, a token generation, a heatmap render. **Every tool that creates, updates, or deletes a real Engage entity — `post`/`put`-`ab-test-project`, `post-persona`/`delete-persona`, `post-segments`/`delete-segments`, `post-annotations`/`delete-annotations`, `post-customer-journey`, `post-traffic-filter`, and 45 others — has no test that ever invokes its own handler code.**

This is a sharper problem than "the fixture/helper gap versus `cms-dev-mcp`" (29 helper dirs there vs. 4 here) makes it sound, and it's important to be precise about *why*: the 3 fixture builders added this session (`AbTestProjectBuilder`, `DocumentTypeFixture`, `DomainFixture`) create/delete data by calling the **raw Orval API client directly** (`getUmbracoEngageManagementAPI().postAbTestProject(...)`) or the **chained CMS MCP** — neither path invokes this project's own `post-ab-test-project.ts` tool handler. So even `ab-test-project`, which now has a real fixture, still has **zero coverage of the actual `post-ab-test-project`/`put-ab-test-project`/`delete-ab-test-project` tool code** — the input validation, output shaping, and `withStandardDecorators` error handling that code path is responsible for. Seeding fixture data and testing a tool are two different things; this session only did the first for anything beyond a handful of tools.

**Action — prioritize by risk, not by convenience:**
1. **First**: every `delete-*` tool (14 total, ~13 currently untested) — these are `destructiveHint: true` by definition; an untested delete tool is the single highest-risk gap in the whole project.
2. **Second**: the `post`/`put` tools for entities other tools *read* elsewhere in the suite (`post-ab-test-project`, `post-persona`, `post-segments`, `post-annotations`, `post-customer-journey`, `post-campaign-group`, `post-referral-group`, `post-content-scoring-save`, `post-traffic-filter`) — call the tool handler directly (not the raw API client) in a `beforeAll`/`afterAll` alongside the existing read-tool test, verifying the tool's own response shape, not just that the underlying API call succeeded.
3. **Third**: the remaining read-only (`get`) tools that also have zero coverage — lower risk than mutations, but 90 `get` tools exist and several collections (`ab-test`, `profile`, `referral-scoring`, `umbraco-server`) have none tested at all despite having 1–17 `get` tools each.

Follow the two established fixture sub-patterns when building out coverage (see [Session Changelog §Fixture builders](04-session-changelog.md#fixture-builders-for-integration-tests)), but make sure the actual **test** for a mutation imports and calls that tool's own `handler`, not just the builder that seeds data for a different test — those are complementary, not substitutes for each other:
- **Engage-native entities** (A/B tests, personas, segments, …): call `getUmbracoEngageManagementAPI()` directly in a builder for setup/teardown; write a *separate* test that imports and calls the actual tool (e.g. `post-persona.ts`'s `handler`) and asserts on its own return shape.
- **CMS-native entities** the Engage tools only *read* (content types, documents, domains): use `mcpClientManager.callTool("cms", toolName, args)` — see `content-types/__tests__/helpers/document-type-fixture.ts` and `cockpit-auth/__tests__/helpers/domain-fixture.ts` for the pattern, including the `content[].text` fallback for chained tools without an `outputSchema`.

`umbraco-mcp-dev-cms` has **29** `__tests__/helpers/` directories to this project's 4 (up from 1 before this session) — some substantial enough to have their own unit tests (e.g. `document/__tests__/helpers/document-builder.test.ts`). That gap is real, but it's a symptom of the coverage problem above, not the problem itself — more helpers without more tests calling actual tool handlers won't move the 93% number.

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
