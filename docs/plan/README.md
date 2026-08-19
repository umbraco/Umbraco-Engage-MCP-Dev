# Engage MCP — Analysis & Forward Plan

**Date:** 2026-08-19
**Compared against:** `umbraco-mcp-dev-cms` (the base Umbraco CMS MCP server — the project this server chains to)

## Executive summary

This Engage MCP server is **functionally solid**: 146 tools across 37 real collections, live-verified OAuth auth against a real Umbraco+Engage instance, working CMS chaining (494 tools total in one session), and — as of this session — 48/49 integration test suites passing genuinely (not just locally-lucky). The core product works.

That said, "48/49 passing" measures *tests that exist*, not *coverage* — and coverage is the weakest part of this project by a wide margin: **68% of all tool files, and 93% of mutation tools specifically, are never exercised by any test at all** (see [Testing Improvements §4](01-testing-improvements.md#4-integration-test-coverage-is-critically-low--mutation-tools-especially) for the exact breakdown). This is the single biggest risk in the project today, bigger than any structural gap with `cms-dev-mcp` below.

Structurally, though, it's **much younger** than its sibling `umbraco-mcp-dev-cms`, for a simple reason: `umbraco-mcp-dev-cms` has 378 commits over 15 months of real iteration; this repo has 5 commits, all from today, because it had no git history at all before this session. Every maturity gap below is a "hasn't had time yet" gap, not a design flaw — `cms-dev-mcp` is the answer key for what this project should grow into.

This folder breaks the path there into three independent stage plans, plus a changelog:

1. **[Testing improvements](01-testing-improvements.md)** — demo-site setup without Docker, real eval tests, CI, and closing the fixture/helper gap with `cms-dev-mcp`.
2. **[Upgrades](02-upgrades.md)** — concrete dependency version deltas (SDK, Engage, Playwright, orval, claude-agent-sdk) and which ones are load-bearing vs. cosmetic.
3. **[Recent changes in `cms-dev-mcp` not yet in this MCP](03-recent-changes.md)** — the actual portable diff: concrete infra/pattern changes (scripts, Jest config, CI, a real bug-risk finding around GUID validation) verified directly against `cms-dev-mcp`'s current files, to bring this project into line. Also corrects two claims from this doc's own comparison table below (the `claude-agent-sdk` row, and the SDK-versioning framing) — see its "Corrections" section.
4. **[Session changelog](04-session-changelog.md)** — what this session itself did to get from 37/49 to 48/49 passing integration tests, kept as context for what "recent" means for *this* project going forward.

## Comparison table

| Dimension | `umbraco-mcp-dev-engage` (this repo) | `umbraco-mcp-dev-cms` | Gap |
|---|---|---|---|
| Tool collections / tools | 37 collections, 146 tools | 38 collections, 434 tool files | CMS is the larger surface (expected — it's the base API) |
| Integration test files | 49 | **456** | ~9x |
| Test *coverage* (not just file count) | **68% of tool files, 93% of mutation tools, never exercised by any test** | Not independently measured this pass — assume materially better given 456 files across the same-shaped tool surface | The real gap, bigger than the file-count ratio suggests — see [Testing Improvements §4](01-testing-improvements.md#4-integration-test-coverage-is-critically-low--mutation-tools-especially) |
| Test builder/helper dirs | 4 (1 pre-existing + 3 added this session) | **29**, some with their own unit tests | CMS treats fixture infra as first-class code — though more helpers alone won't fix the coverage row above; they need tests that call the actual tool handlers, not just fixtures |
| Non-deterministic field normalization | Shared `src/testing/normalize-volatile-fields.ts` (added this session) | One-off inline patches per test, no shared helper | We're actually ahead here now |
| Eval tests | 3 files, 2 of 3 reference tools (`get-example`, `create-widget`) that don't exist in this project — unmodified template boilerplate | **16 real eval files**, verified against actual tool names | CMS evals are usable; ours currently are not |
| Third test tier (`e2e-sdk`) | None | `tests/e2e-sdk/`, separate Jest config | Gap |
| CI | None — no `.github/` at all | Full `test.yml` (compile→build→boot Umbraco→API user→`npm test`→Playwright), gated `evals` job on release PRs, Dependabot | Gap |
| Demo-site provisioning | Hand-built this session; requires Docker + SQL Server + manual `dotnet dev-certs` trust | `demo-site-template/` + `bootstrap-demo-site.sh --sqlite` — zero external dependencies | CMS's approach would have saved most of this session's setup pain |
| `CLAUDE.md` header | Still says *"Starter kit for creating new Umbraco MCP server projects... Not published to npm"* | Fully de-templated: *"Umbraco CMS MCP — Repository Conventions"* | Cosmetic but visible |
| SDK versions | `@umbraco-cms/mcp-server-sdk` / `mcp-hosted` pinned to `17.0.0-beta.28` | `^1.0.0-beta.31` (renumbered epoch) | Behind by a full versioning-scheme migration |
| Tool-call telemetry | None — installed SDK predates the feature | Also none — `1.0.0-beta.31` predates it too | **Neither project has this yet.** Ships in SDK `1.0.0-beta.36`+: one privacy-conscious OpenTelemetry-style span per tool call, auto-applied via `withStandardDecorators` — see [Upgrades §2](02-upgrades.md#2-umbraco-cmsmcp-server-sdk-and-umbraco-cmsmcp-hosted) |
| MCP chaining | Chains **to** CMS (`cms--` prefix, 348 proxied tools, confirmed live) | Chains to nothing — it's the base server | Expected, not a gap |
| Git history | 5 commits, all 2026-08-19 (this session) | 378 commits, 2025-04-17 → 2026-07-30, gitflow + formal releases | Expected for a repo this new |
| Published to npm | No | Yes (`alpha` publish channel) | Roadmap item, not urgent |

## How to use this

Each stage doc is independent and can be picked up on its own. Recommended order given what's actually blocking right now:

1. Start with **testing improvements** §1 (demo-site via `bootstrap-demo-site.sh --sqlite`, portable as-is per [recent changes §D](03-recent-changes.md#d-scriptsbootstrap-demo-sitesh)) — it removes the single biggest source of session friction (Docker, SQL Server, manual cert trust) for anyone picking this project up next, and is a prerequisite for everything below (you need a running demo-site to write or run any integration test).
2. **Testing improvements §4 — close the mutation-tool coverage gap.** This is the highest-*risk* item in the whole plan, not just the highest-friction one: 52 of 56 mutation tools have zero test coverage of their own handler code. Start with `delete-*` tools (highest risk by definition), then the `post`/`put` tools for entities other tests already read.
3. **Testing improvements** §2a — diagnose the eval-harness crash by diffing eval setup against `cms-dev-mcp`'s (confirmed *not* an `@anthropic-ai/claude-agent-sdk` version issue — see [upgrades §1](02-upgrades.md#1-anthropic-aiclaude-agent-sdk--investigate-dont-just-bump)). This unblocks eval-test rewrites (§2), which testing improvements otherwise can't move past.
4. **Upgrades §2** (the SDK) unlocks two concrete things worth having sooner rather than later: tool-call telemetry (free once upgraded, zero per-tool changes) and the GUID/UUID output-validation fix (closes a live untested-risk gap). Do this after the coverage work above has a regression baseline in place, not before.
5. Everything else in testing improvements, upgrades, and recent changes can be done in any order after that.
