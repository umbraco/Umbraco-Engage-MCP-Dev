# Stage 3 — Recent Additions and Changes to the Codebase

A changelog of this session's work (2026-08-19), the baseline everything above measures from. The repo had no git history before this session — every commit below is the entire history of this project's version control to date.

## Environment & build fixes

- `node_modules/.bin/*` had lost their executable bit (`tsc`, `tsup`, etc. all failed with "Permission denied") and `npm run build` separately hit npm's [optional-dependencies bug](https://github.com/npm/cli/issues/4828) (`Cannot find module @rollup/rollup-darwin-arm64`). Fixed with a clean `rm -rf node_modules package-lock.json && npm install`.

## Demo-site created from scratch (not committed — `demo-site/` is gitignored, per project convention)

No `demo-site/` existed in this repo before this session. Built one by hand:
- `demo-site.csproj` — `Umbraco.Cms 17.6.0` + `Umbraco.Cms.DevelopmentMode.Backoffice 17.6.0` + `Umbraco.Engage 17.2.1` (see [Upgrades §6](02-upgrades.md#6-umbracoengage-demo-site-version--already-resolved-this-session-flagging-the-tradeoff-for-the-future) for why this exact patch version). Deliberately dropped the `Clean` starter-kit package after it caused an `NU1107` version-conflict restore failure against this CMS version.
- SQL Server via a local Docker container (`sql`, already running with `sa`/`Moloko99`), with the target database created manually first (`CREATE DATABASE [umbraco-engage-mcp]`) — Umbraco's unattended install doesn't create it against an existing SQL Server login.
- `appsettings.Development.json` unattended install (`admin@admin.com` / `1234567890`), `Properties/launchSettings.json` pinned to `https://localhost:44448` to match `.env`'s `UMBRACO_BASE_URL` exactly.
- `dotnet dev-certs https --trust` — needed a human to approve a macOS Keychain prompt (couldn't be automated; Chrome also refuses to let automation click through a self-signed-cert interstitial at all, a separate blocker this resolved).
- **This entire section is what [Testing Improvements §1](01-testing-improvements.md#1-adopt-cms-dev-mcps-demo-site-provisioning-pattern) proposes replacing** with `umbraco-mcp-dev-cms`'s `bootstrap-demo-site.sh --sqlite` pattern, which needs none of Docker, SQL Server, or manual cert setup.

## API user creation — found and fixed a version-specific bug in a copied script

`umbraco-mcp-dev-cms/scripts/create-api-user.mjs` creates the Umbraco API user (`umbraco-back-office-mcp` / `1234567890`) entirely via the Management API (admin login → PKCE token exchange → create API user → set client credentials) — no backoffice UI needed, which mattered because backoffice UI automation via Chrome proved unreliable this session (modal pickers rendering off-screen, stale shadow-DOM state after rapid navigation). Copied it into this repo's `scripts/`, then found its hardcoded Swagger OAuth `redirect_uri` (`/umbraco/openapi/oauth2-redirect.html`) didn't match this Umbraco version's actual registered `umbraco-swagger` OpenIddict client (`/umbraco/swagger/oauth2-redirect.html`) — fixed and documented the version-sensitivity in `CLAUDE.md`.

## End-to-end verification

- `--call get-main-switch` / `get-statistics` / `get-configuration` against the live demo-site — real Engage API data returned correctly.
- Full stdio MCP session: **494 tools** total — 146 native Engage + 348 proxied from the chained CMS MCP (`cms--` prefix), confirmed via `Registered 348 proxied tool(s) from chained MCP servers` in the server's own startup log, no errors.

## Git repository (commits `adee014` → `f1833a8`)

| Commit | What |
|---|---|
| `adee014` | Initial commit — the entire pre-existing project (373 files), git-initialized for the first time this session |
| `1e208ee` | Seeded 3 missing integration test fixtures: `AbTestProjectBuilder` (Engage API directly), `DocumentTypeFixture` + `DomainFixture` (via chained CMS MCP, `mcpClientManager.callTool("cms", ...)`) — see below |
| `fece165` | Documented the required `Umbraco.Engage 17.2.1` pin (demo-site only; not a repo file change beyond `CLAUDE.md`) |
| `571de6c` | Added `src/testing/normalize-volatile-fields.ts`, applied to 5 tests with background-job/machine-local non-deterministic fields |
| `f1833a8` | Extended the same normalizer to `createdByUmbracoUserName` (install-identity attribution) for 2 more tests |

### Fixture builders for integration tests

Three of `get-ab-test-project-all` / `get-content-types-all` / `get-cockpit-auth-domains` were failing against a fresh, empty demo-site because their checked-in snapshots expected pre-existing fixture data from whatever environment originally captured them (a specific A/B test project, 17 content types from the "Clean" starter kit, a registered domain). Rather than accept the mismatch or fake the data, built real fixtures:

- **`ab-test-project/__tests__/helpers/ab-test-project-builder.ts`** — Engage-native entity, created/deleted directly via `getUmbracoEngageManagementAPI()`, same pattern as the pre-existing `AnnotationBuilder`.
- **`content-types/__tests__/helpers/document-type-fixture.ts`** and **`cockpit-auth/__tests__/helpers/domain-fixture.ts`** — CMS-native entities Engage only *reads* (a content type; a published document with a domain assigned), created/deleted via the chained CMS MCP directly: `mcpClientManager.callTool("cms", "create-document-type"/"create-document"/"publish-document"/"put-document-domains", args)`. This was the first real use of that chaining mechanism for *test setup* rather than production tool logic, and surfaced a reusable finding: proxied chained tools without an `outputSchema` return data in `content[].text` (a JSON string) rather than `structuredContent` — handled with a new `src/testing/chained-tool-result.ts` helper (`extractChainedResult`/`extractId`).
- Reduced integration test failures from 6 to 3 this way, plus documented which failures *aren't* fixable by seeding (server-side attribution fields, auto-increment IDs).

### Non-deterministic field normalization

Found a real trap live: tests "fixed" earlier in the session with a one-time `jest -u` (background-job timestamps/durations/run-ids, `get-configuration`'s machine-local reporting timezone) **failed again on the very next full-suite run**, just from time passing — proof they'd flake in CI too, on any container, at any time. Replaced the one-off patches with a shared, extensible `normalizeVolatileFields()` helper and applied it everywhere the pattern occurred, including a second latent instance caught while fixing the first (`get-ab-test-project-all`'s hardcoded `"MCP API User"` — would have broken under a differently-named API user in CI).

**Net result at this point: integration tests went from 37 passing / 11 failing (session start) to 48 passing / 1 skipped / 0 failing** — the 1 skip is a pre-existing skip unrelated to this session's work.

### `extractChainedResult` correction

Caught while writing the delete-tool tests below: `src/testing/chained-tool-result.ts` (written earlier this session, believing the installed SDK lacked this function) turned out to duplicate `extractChainedResult`, which was already exported by the currently-installed `@umbraco-cms/mcp-server-sdk@17.0.0-beta.28` the whole time — confirmed directly in its `dist/index.d.ts`. Fixed: the local file now re-exports the SDK's own function instead of reimplementing it, keeping only the genuinely-new `extractId` convenience wrapper. [Upgrades §2](02-upgrades.md#2-umbraco-cmsmcp-server-sdk-and-umbraco-cmsmcp-hosted) has the full correction (it had also propagated into that doc as a wrong "new in beta.36" claim).

### Closing the `delete-*` tool coverage gap

Per [Testing Improvements §4](01-testing-improvements.md#4-integration-test-coverage-is-critically-low--mutation-tools-especially), all 14 `delete-*` tools in the project went from mostly-untested to every one having a test that calls the tool's own handler directly (not just a builder that happens to seed data via the raw API client). Added 9 new fixture builders (`applied-personalization`, `campaign-group`, `persona`, `referral-group`, `traffic-filter`, `customer-journey`, `segments`, plus reused the existing `ab-test-project`/`annotations` ones) and 15 new test files, following the `build-tools-tests` skill's one-file-at-a-time discipline (write → compile → run → fix → next) throughout.

This surfaced real, inconsistent API behavior worth knowing before writing more tests in this codebase — verified empirically against the live instance rather than assumed from the schema:
- **Server-overridden `unique` fields**: `persona` and `customer-journey`'s create endpoints silently discard the client-supplied `unique` and assign their own — the builder must read it back from the response (`response.data?.persona?.unique`) rather than trust what it sent. `ab-test-project`, `campaign-group`, `referral-group`, and `segments` all honor the client-supplied `unique` as-is.
- **Delete idempotency is per-entity, not a project-wide convention**: `annotations`, `ab-test-variant`, `applied-personalization`, `persona`, `referral-group`, `campaign-group`, `customer-journey`, `content-scoring`, and `segments` all return success for a non-existent id. `ab-test-project` and `traffic-filter` both return a real error instead. Don't assume either way — probe it.
- **`ab-test` requires a real dependency chain to actually persist**: posting a minimal valid-per-schema A/B test returns `{ validationResults: { isValid: false, errors: [...] } }` and does *not* create a record (confirmed via `get-ab-test-all` staying empty) unless a goal, a configured page, and a second variant beyond the default already exist. Building that fixture chain was judged out of scope for testing `delete-ab-test` specifically — the test instead documents this limitation and covers the tool's real, reliably-reproducible not-found behavior.
- **`content-scoring`'s list endpoint (`get-content-scoring-all`) is already broken on this instance** (a pre-existing 400, captured in its own already-existing snapshot before this session touched it) — with no way to discover a real persisted scoring entry's id (its save endpoint is also void), both `delete-content-scoring-persona` and `delete-content-scoring-journey`'s tests cover only the not-found path, documented inline.
- **`delete-segments-delete-segment-content` enforces a business rule**: Engage refuses to touch any segment not prefixed `engage_ab-testing_` or `engage_personalization_`, throwing a full .NET stack trace back through the API otherwise. Both the valid-prefix success path and the rejected-prefix error path are covered.
- **Response shapes vary per endpoint** in ways worth knowing before assuming: `post-traffic-filter` returns a bare UUID string (not an object); `delete-segments-delete-segment-content` returns `{ success: true }` (the SDK wraps a bare boolean into an object, since MCP `structuredContent` must be a JSON object).

**Net result: integration tests went from 48 passing / 1 skipped to 63 passing / 1 skipped, with 0 failures**, verified stable across two full consecutive `npm test` runs (all the new builders create+delete fresh random data every run, so repeat-run stability was a real risk, not just a formality).

## Eval tests — investigated, found broken, not yet fixed

Confirmed `tests/evals/example-crud.test.ts` and `tests/evals/tool-filtering.test.ts` reference tools (`get-example`, `create-widget`, etc.) that don't exist anywhere in this project — unmodified SDK-template boilerplate. Separately, actually running any eval crashes inside `@anthropic-ai/claude-agent-sdk`'s own init (`TypeError: Object not disposable`) before reaching tool logic at all, unrelated to the tool-name issue — and, confirmed later in the session, *not* an upstream SDK version issue either (`umbraco-mcp-dev-cms` pins the exact same version and its evals work). Neither has been fixed yet — both are captured in [Testing Improvements §2/§2a](01-testing-improvements.md#2-rewrite-the-eval-tests-against-real-tool-names) and [Upgrades §1](02-upgrades.md#1-anthropic-aiclaude-agent-sdk--investigate-dont-just-bump) as the next concrete steps.

## This document

`docs/plan/` itself — written after a background research task compared this repo's structure, testing maturity, tooling, dependency versions, documentation, and git history against `umbraco-mcp-dev-cms` in detail (18 tool calls, verified against both repos directly rather than from memory).
