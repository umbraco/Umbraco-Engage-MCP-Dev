# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on the Umbraco Engage MCP server.

## Overview

An MCP server for [Umbraco Engage](https://umbraco.com/products/umbraco-engage/), built from the `@umbraco-cms/mcp-template` starter kit.

## Commands

```bash
npm run build          # Build with tsup
npm run compile        # Type-check only
npm run generate       # Generate API client from OpenAPI spec (Orval)
npm run inspect        # Run MCP inspector
npm run test           # Unit tests only
npm run test:evals     # LLM eval tests (requires Claude Code subscription or ANTHROPIC_API_KEY)
npm run test:all       # Both unit and eval tests
```

**Single test:** `npm test -- --testPathPattern=src/path/__tests__/file.test.ts`

**Always use npm scripts** (`npm run compile`, `npm test`, `npm run build`) — never run `node`, `npx tsc`, or `jest` directly.

## Source Structure

```
src/
├── umbraco-api/
│   ├── api/
│   │   ├── client.ts          # API client configuration
│   │   └── generated/         # Orval-generated client and Zod schemas
│   ├── tools/
│   │   └── {collection-name}/
│   │       ├── index.ts       # ToolCollectionExport
│   │       ├── get/           # GET tools
│   │       ├── post/          # POST tools
│   │       ├── put/           # PUT tools
│   │       ├── delete/        # DELETE tools
│   │       └── __tests__/     # Integration tests
│   └── mcp-client.ts          # MCP chaining client instance
├── config/
│   ├── index.ts               # Exports all config
│   ├── server-config.ts       # Custom config field definitions
│   ├── slice-registry.ts      # Valid slice names
│   ├── mode-registry.ts       # Mode-to-collection mappings
│   └── mcp-servers.ts         # Chained MCP server configs
├── mocks/
│   ├── server.ts              # MSW server setup
│   ├── handlers.ts            # API mock handlers
│   ├── store.ts               # In-memory mock data
│   └── jest-setup.ts          # Test setup file
├── testing/                   # Test helpers specific to this project
└── index.ts                   # Server entry point
tests/
└── evals/
    ├── jest.config.ts         # Separate Jest config for evals
    ├── helpers/
    │   └── e2e-setup.ts       # configureEvals setup (loaded via setupFilesAfterEnv)
    └── *.test.ts              # LLM eval test files
```

## Configuration

**Environment Variables / CLI Flags:**

| Variable | CLI Flag | Purpose |
|----------|----------|---------|
| `UMBRACO_CLIENT_ID` | `--umbraco-client-id` | OAuth client ID |
| `UMBRACO_CLIENT_SECRET` | `--umbraco-client-secret` | OAuth client secret |
| `UMBRACO_BASE_URL` | `--umbraco-base-url` | Umbraco instance URL |
| `UMBRACO_TOOL_MODES` | `--umbraco-tool-modes` | Comma-separated modes |
| `UMBRACO_INCLUDE_SLICES` | `--umbraco-include-slices` | Include only these slices |
| `UMBRACO_EXCLUDE_SLICES` | `--umbraco-exclude-slices` | Exclude these slices |
| `UMBRACO_READONLY` | `--umbraco-readonly` | Block write operations |
| `DISABLE_MCP_CHAINING` | `--disable-mcp-chaining` | Disable MCP server chaining |

Custom fields defined in `config/server-config.ts`.

## Registries

**slice-registry.ts** - Valid slice names for tool categorization:
- Base slices: `create`, `read`, `update`, `delete`, `list`
- Extended: `tree`, `search`, `publish`, `move`, `copy`, etc.
- Tools with empty slices array are categorized as `other`

**mode-registry.ts** - Named groups mapping to collections:
- Example: `example` mode includes `example` collection
- Users set `UMBRACO_TOOL_MODES=example,content` to enable groups

## Tool Conventions

- One file per tool in operation-type subfolder (`get/`, `post/`, etc.)
- Export default with `withStandardDecorators(tool)`
- Use Zod schemas from Orval-generated `*.zod.ts` files
- Set `slices` array for filtering categorization
- Set `annotations` for MCP hints (`readOnlyHint`, `destructiveHint`, `idempotentHint`)

## Testing

**Testing with Claude Code (`.mcp.json`):**
- The project ships with `.mcp.json` which registers this MCP server in Claude Code automatically
- After `init` + `discover` + `npm run build`, open the project directory in Claude Code — the server is immediately callable
- `.mcp.json` uses `node --env-file=.env ./dist/index.js` so credentials stay in `.env` (gitignored)
- No manual `claude mcp add` required
- **Requires a running `demo-site/` instance** matching `UMBRACO_BASE_URL` in `.env` — see **Demo Site Setup** below if `demo-site/` doesn't exist yet

**Integration tests (`__tests__/`):**
- Run against the real Umbraco instance — no mocking
- Require a running Umbraco instance with an API user configured (see below)
- Call `setupTestEnvironment()` in describe block
- Use builder pattern for test data (e.g., `ExampleBuilder`)
- Test tool handlers directly
- **Seeding fixtures for a fresh/empty demo-site:** some tools list data that doesn't exist on a brand-new install (an A/B test project, a content type, a registered domain). Two patterns, pick by where the entity lives:
  - **Engage-native entities** (A/B tests, personas, annotations, segments, …) — call the Engage API directly via `getUmbracoEngageManagementAPI()` in a builder (see `ab-test-project/__tests__/helpers/ab-test-project-builder.ts`), same as the existing `AnnotationBuilder`. No chaining needed.
  - **CMS-native entities** (content types, documents, domains) that Engage only *reads* — use the chained CMS MCP via `mcpClientManager.callTool("cms", toolName, args)` from `../../../mcp-client.js` (see `content-types/__tests__/helpers/document-type-fixture.ts` and `cockpit-auth/__tests__/helpers/domain-fixture.ts`). Notes:
    - Proxied chained tools often have no `outputSchema`, so results land in `content[].text` (JSON string) rather than `structuredContent` — use `extractChainedResult`/`extractId` from `src/testing/chained-tool-result.ts` to handle both.
    - `mcpClientManager` spawns the chained server as a child process on first `callTool()`/`connect()` — call `mcpClientManager.disconnectAll()` in `afterAll` or Jest hangs on an open handle.
    - Create in `beforeAll`, delete in `afterAll` (delete the document before its document type — Umbraco won't delete a type with content still using it).
  - **Fields you can't seed to a specific value** — `createdByUmbracoUserName` on server-generated records (e.g. Engage's own built-in default traffic-filter rule, or any record the request body can't override) reflects whichever account performed the original install or is calling the API right now — the server ignores what you put in the request body. Umbraco's auto-increment integer content IDs (`rootContentId` etc.) are similarly never reproducible. Don't chase an exact match — normalize the field instead (next bullet).
  - **CI-stability, not just local-machine drift:** several tools return background-job data — timestamps, durations, run ids (`get-reporting-generation-status`) — machine-local values (`get-configuration`'s `reporting.reportingTimeZone`), and install-identity strings (`createdByUmbracoUserName` on `get-traffic-filter-all`, `get-ab-test-project-all`). None of these will ever match a checked-in snapshot on a *different* run, machine, API-user name, or CI container, even right after `-u` — re-running `-u` is a trap, not a fix, since the values just drift again next run. Use the shared `normalizeVolatileFields()` helper (`src/testing/normalize-volatile-fields.ts`) on the result before `toMatchSnapshot()`; extend its field lists if a new tool surfaces the same category of value.
  - **When even the *count* isn't stable, don't snapshot at all:** `get-data-cleanup-runs`/`-logs` and `get-data-generation-logs` list a background job's run history with no API to trigger that job on demand — how many runs exist by the time the test executes is a race against Engage's own internal scheduler, not just a timestamp-formatting issue. Confirmed empirically in CI: two clean-install runs of the same workflow returned different run counts (0 vs 1). `normalizeVolatileFields()` can't fix this since the *array length* itself differs, not just field values inside it — these three tests assert response shape/types instead of `toMatchSnapshot()`.

**Eval tests (`tests/evals/`):**
- LLM-based acceptance tests using Claude Agent SDK
- Require Claude Code subscription or `ANTHROPIC_API_KEY`
- Use `runScenarioTest` with prompt, tools, requiredTools, successPattern
- Separate Jest config at `tests/evals/jest.config.ts`
- Setup loaded automatically via `setupFilesAfterEnv` (no per-file import needed)
- Run with `--runInBand` to avoid parallel API calls

## PR / CI Workflow

Always work via a branch + PR — never push directly to `main`. Create a branch, push it, open a PR, and let `.github/workflows/test.yml` run before merging.

Whenever you open a new PR or push updates to an existing one, do NOT consider the task done at push time. Watch the CI checks and fix any failures automatically:

1. Open / update the PR.
2. Poll the PR checks (`gh pr checks <number>` / `gh run watch <run-id>`) until every required check has reported, or until a check has clearly failed.
3. For any failing check, read the failure log, diagnose the root cause, fix it in code or the workflow, and push a new commit.
4. Loop on steps 2-3 until all required checks are green.
5. Only then report the PR as ready for review/merge.

Treat a CI failure the same as a local test failure — it's a real regression that blocks shipping, not something to leave for the reviewer to chase down.

## Demo Site Setup

Run `npm run umbraco:bootstrap` (or `npm run umbraco:start` to bootstrap and launch it in one step) to materialize `demo-site/` from the tracked `demo-site-template/` via `scripts/bootstrap-demo-site.sh` — idempotent, pass `--force` to recreate it. `demo-site-template/` is the source of truth (Umbraco.Cms 17.6.0 + Umbraco.Cms.DevelopmentMode.Backoffice 17.6.0 + Umbraco.Engage 17.2.1 — see its `demo-site-template.csproj`); `demo-site/` itself stays gitignored, since it's each developer's/CI's own working instance including generated `bin/`/`obj/`/`wwwroot/`/`umbraco/` and local secrets in `appsettings.local.json`.

After bootstrapping, write `demo-site/appsettings.local.json` with your DB connection string (see `.github/workflows/test.yml`'s "Configure Umbraco for CI" step for the exact shape), then run `npm run umbraco:start` (or `cd demo-site && dotnet run` if already bootstrapped).

CI (`.github/workflows/test.yml`) does this from scratch on every push/PR: boots a SQL Server service container, bootstraps `demo-site/` from the template, creates the database and the API user, generates Engage's reporting tables (a brand-new install has never run that background job, and several tools query those tables unconditionally), then runs the integration suite collection-by-collection — each collection in its own `jest` process, to avoid a single long-lived process accumulating enough heap across ~35 collections' worth of real API calls to OOM.

If you ever need to rebuild `demo-site-template/` from scratch instead (e.g. bumping the Umbraco/Engage version), the original manual steps were:

1. **`demo-site/demo-site.csproj`** — `Microsoft.NET.Sdk.Web`, `net10.0`, referencing:
   - `Umbraco.Cms` — pin to a version Engage supports (check the target `Umbraco.Engage` nuspec's `Umbraco.Engage.Core` → `Umbraco.Cms.Web.Website` dependency range; `17.6.0` paired with `Umbraco.Engage 17.2.1` is confirmed working). Use exactly `17.2.1`, not `17.2.0` — the `get-package` integration test's checked-in snapshot expects `version: "17.2.1+cb3108d"` (the NuGet package's embedded repository commit); any other Engage version fails that snapshot on build/version alone.
   - `Umbraco.Cms.DevelopmentMode.Backoffice` (same version)
   - `Umbraco.Engage` — do **not** add the `Clean` starter-kit package alongside it unless you pin a `Clean` version whose own `Umbraco.Cms.Web.Website` dependency matches (mismatched ranges cause an `NU1107` version-conflict restore failure)
2. **`Program.cs`** — copy the minimal `CreateUmbracoBuilder().AddBackOffice().AddWebsite().AddComposers().Build()` pattern from a sibling `umbraco-mcp-*` repo's `demo-site/Program.cs`
3. **`appsettings.local.json`** (gitignored) — SQL Server connection string, e.g. against a local `sql` docker container:
   ```json
   { "ConnectionStrings": { "umbracoDbDSN": "Server=localhost,1433;Database=umbraco-engage-mcp;User Id=sa;password=<pwd>;TrustServerCertificate=True" } }
   ```
   Create the target database first (`CREATE DATABASE [umbraco-engage-mcp]`) — Umbraco's unattended install does not create it for you against an existing SQL Server login.
4. **`appsettings.Development.json`** — `Umbraco:CMS:Unattended.InstallUnattended: true` with `UnattendedUserEmail: admin@admin.com` / `UnattendedUserPassword: 1234567890` for a one-shot install
5. **`Properties/launchSettings.json`** — pin `applicationUrl` to match `UMBRACO_BASE_URL` in `.env` (e.g. `https://localhost:44448`) instead of the default dynamic port, so `.env` doesn't need updating every run
6. Trust the dev HTTPS cert once per machine so a browser (or Chrome automation) can open the backoffice without hitting an interstitial: `dotnet dev-certs https --trust`
7. Run it: `cd demo-site && ASPNETCORE_ENVIRONMENT=Development dotnet run`

## API User Setup

Integration tests and the `.mcp.json` server both require an API user in Umbraco with Client ID `umbraco-back-office-mcp` / Secret `1234567890` (matching `.env`).

**Preferred: `scripts/create-api-user.mjs`** — creates the user via the Management API directly (admin login → PKCE token exchange → create API user → set client credentials), no backoffice UI needed:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/create-api-user.mjs https://localhost:44448 admin@admin.com 1234567890
```

This script was copied from `umbraco-mcp-dev-cms/scripts/`. **Check the hardcoded Swagger OAuth `redirect_uri` before reusing it against a different Umbraco version** — it must match the `umbraco-swagger` OpenIddict client's registered redirect URI for your installed CMS version (query `SELECT ClientId, RedirectUris FROM umbracoOpenIddictApplications` in the demo-site's DB to confirm; this changed from `/umbraco/openapi/oauth2-redirect.html` to `/umbraco/swagger/oauth2-redirect.html` between versions).

**Fallback: manually via the Umbraco backoffice UI** (Settings > Users > Create > API User) if the script's OAuth flow doesn't match your version — grant the user appropriate permissions for the APIs being tested, then set the same Client ID/Secret above.

## Tool Types Codegen

`npm run build` runs `umbraco-mcp-generate-types` as a `postbuild` step. This walks the compiled `dist/collections.js`, runs every tool's input/output Zod schema through codegen, and writes a typed registry to `dist/tool-types.d.ts`. The `./tool-types` subpath in `package.json#exports` makes this importable by anyone who depends on this package and wants to chain to it with type safety:

```ts
import type { McpTemplateTools } from "@umbraco-cms/mcp-template/tool-types";
```

If your MCP is private/internal and no other MCP will chain to it, you can remove the `postbuild` script and the `./tool-types` export — neither is required for the server to run.

See the [SDK docs](../packages/mcp-server-sdk/README.md) and the published [Tool Types Codegen guide](https://docs.umbraco.com/) for full usage.

## API Client

Uses Orval to generate typed client from OpenAPI spec:
1. Configure `orval.config.ts` with the Swagger URL
2. Run `npm run generate`
3. Client and Zod schemas generated to `src/umbraco-api/api/generated/`

Always pass `CAPTURE_RAW_HTTP_RESPONSE` to API methods when using toolkit helpers.

## Hosted Worker (`src/worker.ts`)

The template includes a Cloudflare Worker entry point for hosted deployment. Key configuration:

- `McpAgent.serve("/mcp", { binding: "MCP_AGENT" })` — use `.serve()` for Streamable HTTP (NOT `.mount()` which is SSE)
- `new_sqlite_classes` in `wrangler.toml` migrations (agents library requires SQLite-backed DOs)
- `.dev.vars` — local secrets including `UMBRACO_SERVER_URL` for self-signed cert workaround
- Umbraco needs the Worker registered as an authorization_code OpenIdDict client via a C# Composer (backoffice UI only supports client_credentials)

Run locally: `npx wrangler dev --port 8787`
Test with MCP Inspector in Direct mode: `http://localhost:8787/`
