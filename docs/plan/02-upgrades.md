# Stage 2 — Upgrades

Concrete version deltas found this session (checked against the npm registry / NuGet directly, not guessed). Ordered by how load-bearing each one is, not by size of the version jump.

## 1. `@anthropic-ai/claude-agent-sdk` — investigate, don't just bump

| | |
|---|---|
| Current | `^0.2.39` |
| Latest | `0.3.235` (268 versions shipped since ours) |
| `umbraco-mcp-dev-cms` uses | `0.2.39` — **the exact same version, pinned with no caret**, and its 16 eval tests reportedly work |

**Correction, verified against `umbraco-mcp-dev-cms` directly:** this section originally recommended bumping this package to fix the eval-harness crash below. That recommendation was wrong. Since the sibling project pins the identical version and its evals work, the crash is not an upstream SDK bug waiting to be fixed by a version bump — it's something specific to this project's environment or eval setup:
```
TypeError: Object not disposable
  at ... node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs:8:1096
```
**Recommendation:** before touching the version pin, diff this project's `tests/evals/helpers/e2e-setup.ts` against `umbraco-mcp-dev-cms`'s equivalent eval setup/config — the difference is almost certainly there (a missing flag, a Node version mismatch, a config option their setup passes that ours doesn't), not in the dependency version. See [Recent Changes §Corrections](03-recent-changes.md#corrections-to-the-earlier-structural-pass-readmemd--02-upgradesmd) for the verification.

## 2. `@umbraco-cms/mcp-server-sdk` and `@umbraco-cms/mcp-hosted`

| | |
|---|---|
| Current | `17.0.0-beta.28` (both) |
| `umbraco-mcp-dev-cms` uses | `^1.0.0-beta.31` |
| Latest on npm | `1.0.0-beta.36` |

**This is a versioning-epoch change, not a normal patch bump.** The SDK appears to have been renumbered from a CMS-major-tied scheme (`17.x`) to a product-independent one (`1.x`) at some point after `17.0.0-beta.28` was cut. `umbraco-mcp-dev-cms` already tracks the new scheme; this project is pinned to the old one and is now two things behind at once: the epoch change itself, plus 8 beta releases within the new epoch (`.31` → `.36` is what CMS uses; latest is `.36`).

**Recommendation:** don't blind-bump this — check `umbraco-mcp-base`'s (the SDK's source monorepo, checked out locally at `/Users/philw/Projects/umbraco-mcp-base`) commit history between the two versions for breaking changes before upgrading, since a full version-scheme migration is exactly the kind of change likely to include breaking API changes to `ToolDefinition`, `createMcpClientManager`, or the CLI flags this project depends on throughout `src/`. Test thoroughly against the full integration suite (now 48/49 genuinely passing — a good regression baseline) after upgrading.

**Concrete reason this matters beyond "staying current":** the installed `17.0.0-beta.28` has no `./orval` subpath export at all (confirmed — its `package.json` exports only `.`, `./testing`, `./evals`, `./config`, `./helpers`, `./types`, `./constants`). `umbraco-mcp-dev-cms`'s newer SDK exports `postProcessZodFiles` from `@umbraco-cms/mcp-server-sdk/orval`, which relaxes generated `zod.uuid()` calls to `zod.guid()` — necessary because Umbraco returns non-RFC4122-compliant GUIDs in some responses (e.g. sequential IDs packed into GUID format), which strict `zod.uuid()` rejects. This project's generated `umbracoEngageManagementApi.zod.ts` currently has 605 `zod.uuid()` calls and zero `zod.guid()` calls — a live, untested risk that any Engage response containing such an ID would fail output validation. See [Recent Changes §I](03-recent-changes.md#i-claudemd--rulesyncrulesmd--structure-worth-adopting-one-piece-of-content-is-a-real-bug-risk-finding) for the full finding. This fix is not portable by copying code — it requires this SDK upgrade first.

**A second concrete reason, found while checking the above — telemetry: neither `umbraco-mcp-dev-cms` nor this project has it yet, but the gap is closing under us.** Verified directly against published npm tarballs, not just local checkouts:

| SDK version | Has telemetry exports? |
|---|---|
| `17.0.0-beta.28` (this project) | No |
| `1.0.0-beta.31` (`umbraco-mcp-dev-cms`, checked its installed `node_modules`) | No |
| `1.0.0-beta.36` (latest on npm) | **Yes** |

`umbraco-mcp-base`'s `packages/mcp-server-sdk/src/telemetry/` (`with-telemetry.ts`, `adapter.ts`, `attributes.ts`, `tool-collection-registry.ts`) implements one OpenTelemetry-style span per tool call, applied automatically to **every** tool via `withStandardDecorators` — not an opt-in a tool author has to remember. It's deliberately privacy-conscious: per its own doc comment, it records outcome *category* only (`success`/`validation_error`/`api_error`/`handler_error`/`unknown_error`), never tool arguments, results, or error message text, since those routinely carry customer paths/ids/payloads. The actual tracing backend is host-injected (`setTelemetryAdapter`) — the SDK ships the instrumentation points, not a vendor.

Since this project already calls `withStandardDecorators(tool)` on every one of its 146 tools (confirmed — `grep -rl withStandardDecorators` matches all of them), **upgrading the SDK turns telemetry on for the entire tool surface with zero changes to any individual tool file.** No portable code to copy from `cms-dev-mcp` here (it doesn't have this either yet) — this is purely a reason to prioritize the SDK upgrade itself.

**Correction, caught while writing new tests after this doc was first drafted:** the claim that `extractChainedResult` was new to `1.0.0-beta.36` was wrong — it's already exported by the currently-*installed* `17.0.0-beta.28` (confirmed directly in `node_modules/@umbraco-cms/mcp-server-sdk/dist/index.d.ts`). This project's `src/testing/chained-tool-result.ts`, written from scratch earlier this session, duplicates an SDK function that was available the whole time — not something the SDK upgrade would newly unlock. This should be fixed now, independent of the upgrade: replace the two call sites (`content-types/__tests__/helpers/document-type-fixture.ts`, `cockpit-auth/__tests__/helpers/domain-fixture.ts`) with `import { extractChainedResult } from "@umbraco-cms/mcp-server-sdk"` and delete the local file. (`validateUUID` is also already exported, separately from the `postProcessZodFiles`/GUID-vs-UUID Orval fix above, which genuinely is absent from this version — confirmed no `./orval` subpath export exists on `17.0.0-beta.28`.)

## 3. `@modelcontextprotocol/sdk`

| | |
|---|---|
| Current | `^1.25.1` |
| Latest | `1.30.0` |
| `umbraco-mcp-dev-cms` uses | `^1.28.0` |

Lower risk than the above — this is the underlying MCP protocol SDK both projects depend on directly. Should be safe to bump in step with (or slightly ahead of) `umbraco-mcp-dev-cms`'s pin.

## 4. `orval` — major version behind

| | |
|---|---|
| Current | `^7.8.0` |
| `umbraco-mcp-dev-cms` uses | `^8.17.0` |

A major version gap. `orval` generates the typed API client (`src/umbraco-api/api/generated/umbracoEngageManagementApi.ts` and its `.zod.ts` companion) from the OpenAPI spec — upgrading across a major version may change generated output shape. **Recommendation:** upgrade in its own commit, regenerate (`npm run generate`), and diff the generated files before touching anything else, so any breakage is isolated and attributable.

## 5. `@playwright/test`

| | |
|---|---|
| Current | `^1.52.0` |
| `umbraco-mcp-dev-cms` uses | `^1.58.2` |

Used by `tests/hosted-e2e/`. Low risk, worth bumping in step with the CMS project for consistency.

## 6. Umbraco.Engage demo-site version — already resolved this session, flagging the tradeoff for the future

`demo-site/demo-site.csproj` is pinned to **`Umbraco.Engage 17.2.1`** specifically (not `17.2.0`, not latest `17.3.1`). This wasn't arbitrary: NuGet's published `17.2.1` package embeds repository commit `cb3108d4b1fa...`, which matches the `get-package` integration test's checked-in snapshot (`version: "17.2.1+cb3108d"`) *exactly* — installing this one version made that test pass against its original, unmodified snapshot with zero changes needed.

**The tradeoff to be aware of going forward:** the moment the demo-site is upgraded to track a newer Engage release (currently latest stable is `17.3.1`; CMS itself is on `17.6.0`), `get-package`'s snapshot will need a `jest -u` update to accept the new version string — this is expected and fine, *unlike* the non-deterministic fields normalized in [Testing Improvements §5](01-testing-improvements.md#5-keep-extending-normalizevolatilefields-dont-hand-patch-with--u), a real Engage version bump is a one-time, deliberate change, not something that drifts on every run. Don't be surprised by it; just re-run `-u` for that one file when it's time to move off `17.2.1`.

## 7. Documentation debt (not a dependency, but adjacent)

`CLAUDE.md`'s header still reads *"This file provides guidance to Claude Code (claude.ai/code) when working with the MCP server template"* / *"Starter kit for creating new Umbraco MCP server projects. Copy this folder to start a new project. Not published to npm."* — despite the substantial Demo Site Setup / API User Setup / testing-fixture sections added this session further down, the header is stale template boilerplate that reads like a scaffold repo rather than a real product's docs (compare `umbraco-mcp-dev-cms`'s de-templated header: *"Umbraco CMS MCP — Repository Conventions"*). Cheap fix, worth doing whenever `CLAUDE.md` is next touched.
