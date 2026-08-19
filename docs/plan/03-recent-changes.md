# Stage 3 — Recent Changes in `cms-dev-mcp` Not Yet in This MCP

Concrete, portable infrastructure/pattern changes present in `umbraco-mcp-dev-cms` (checked directly against its current files, not memory) that this project should adopt to bring itself into line. Excludes anything CMS-domain-specific (actual tool implementations for `document`/`media`/`member`/etc. — no Engage equivalent, not portable).

**Note:** `umbraco-mcp-dev-cms` is under active, ongoing development — two of the items below (`bootstrap-demo-site.sh`, `.github/dependabot.yml`) changed on disk *while this document was being written*, in ways consistent with normal iteration (minor reordering, cadence simplification). The content quoted below is the state as of this check; re-verify before actually porting, since this a moving target, not a frozen release to diff against once.

## Corrections to the earlier structural pass (README.md / 02-upgrades.md)

1. **`@anthropic-ai/claude-agent-sdk` is pinned to the exact same version, `0.2.39`** in `cms-dev-mcp`'s `package.json` — not a range, the literal same pin — and its 16 eval tests reportedly work. **[Upgrades §1](02-upgrades.md#1-anthropic-aiclaude-agent-sdk--highest-priority) was wrong to recommend bumping this as the fix for our eval crash.** The `TypeError: Object not disposable` this project hits is an Engage-side environment/config issue, not something fixed by a newer upstream SDK version. Needs its own investigation — start by diffing this project's `tests/evals/helpers/e2e-setup.ts` against `cms-dev-mcp`'s equivalent eval setup file.
2. **`.mcp.json` is deliberately *not* tracked in `cms-dev-mcp`'s git repo** — its `.gitignore` has a broad rulesync-generated block ignoring every AI tool's local config (Cursor, Cline, Copilot, Claude, etc.), with `.mcp.json` caught by that pattern. This project **commits** `.mcp.json` on purpose, per its own `CLAUDE.md` ("No manual `claude mcp add` required"). **Do not port the ignore pattern for this specific file** — it's a deliberate difference, not a gap.
3. **`scripts/create-api-user.mjs`'s current version in `cms-dev-mcp` still has the *old, broken* redirect URI** (`/umbraco/openapi/oauth2-redirect.html`) — the exact bug this session found and fixed in this project's copy (should be `/umbraco/swagger/oauth2-redirect.html` on the Umbraco version both projects' demo-sites now run). **This project is ahead here, not behind.** Worth reporting the fix back to `cms-dev-mcp` rather than porting anything in the other direction.

## Directly portable

### A. `jest.setup-after-env.ts` — global snapshot path normalizer

Not present in this project at all. A snapshot serializer registered via `expect.addSnapshotSerializer()` that automatically strips machine-specific filesystem paths (`process.cwd()`, `/Users/...`, `/home/...`), Lucene index directory names, and the demo-site folder name from *any* string value in *any* snapshot — no per-test opt-in required, unlike this project's `normalizeVolatileFields()` which every test must call explicitly:

```ts
// jest.setup-after-env.ts
const cwd = process.cwd();
const CWD_REGEX = new RegExp(cwd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
expect.addSnapshotSerializer({
  test: (val: unknown) => typeof val === 'string' && (
    CWD_REGEX.test(val) ||
    /\/(Users|home)\//.test(val) ||
    /\/(users|home)\//.test(val) ||
    /NIOFSDirectory|MMapDirectory/i.test(val) ||
    /\/demo-site(-template)?\//i.test(val)
  ),
  serialize: (val: string, config, indentation, depth, refs, printer) => {
    let normalized = val
      .replace(CWD_REGEX, '<CWD>')
      .replace(/\/(Users|users)\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/\/home\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/NIOFSDirectory|MMapDirectory/gi, 'NORMALIZED_FS_DIR')
      .replace(/\/demo-site(-template)?\//gi, '/<PROJECT>/');
    return printer(normalized, config, indentation, depth, refs);
  },
});
```
Wired into `jest.config.ts` via `setupFilesAfterEnv: ["jest-extended/all", "<rootDir>/jest.setup-after-env.ts"]` (their config also loads `jest-extended/all`, which this project's `jest.config.ts` doesn't — a small additional matcher-library gap).

**This is complementary to, not a replacement for, `src/testing/normalize-volatile-fields.ts`** (added this session): that helper handles *job-data* fields (timestamps, run ids, durations, install-identity strings); this handles *filesystem-path leakage*. Adopt both — port this file as-is, keep the existing helper.

### B. `jest-failure-reporter.ts` + `test-failures.log` + `test:rerun-failures`

Not present in this project. A custom Jest reporter that writes a compact `test-failures.log` (suite/test names + first 5 lines of each failure message) after any run with failures, and deletes the file when everything passes:

```ts
// jest-failure-reporter.ts
import type { AggregatedResult } from "@jest/reporters";
import { writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

const OUTPUT_FILE = join(process.cwd(), "test-failures.log");

export default class FailureReporter {
  onRunComplete(_: Set<unknown>, results: AggregatedResult): void {
    const failures: string[] = [];
    for (const suite of results.testResults) {
      if (suite.numFailingTests === 0) continue;
      failures.push(`FAIL ${suite.testFilePath}`);
      for (const test of suite.testResults) {
        if (test.status === "failed") {
          failures.push(`  ● ${test.ancestorTitles.join(" › ")} › ${test.title}`);
          for (const msg of test.failureMessages) {
            failures.push(msg.split("\n").slice(0, 5).map(l => `    ${l}`).join("\n"));
          }
          failures.push("");
        }
      }
    }
    if (failures.length > 0) {
      writeFileSync(OUTPUT_FILE, [
        `Test Failures — ${new Date().toISOString()}`,
        `${results.numFailedTestSuites} suite(s), ${results.numFailedTests} test(s) failed`,
        "", ...failures,
      ].join("\n"));
      console.error(`\nFailures written to test-failures.log`);
    } else if (existsSync(OUTPUT_FILE)) {
      unlinkSync(OUTPUT_FILE);
    }
  }
}
```
Registered via `reporters: ["default", "<rootDir>/jest-failure-reporter.ts"]` in `jest.config.ts`. Pairs with a new npm script:
```
"test:rerun-failures": "grep '^FAIL ' test-failures.log 2>/dev/null | sed 's/^FAIL //' | tr '\\n' ' ' | xargs -r node --experimental-vm-modules node_modules/jest/bin/jest.js --no-coverage || echo 'No failures to rerun (test-failures.log not found or empty)'"
```
`test-failures.log` needs adding to `.gitignore`. Cheap, immediately useful for the 48-file integration suite this project now has — this session repeatedly re-ran the full suite by hand to see what was still failing; this would have made that faster.

### C. Additional/changed npm scripts

Compared against this project's current `package.json` scripts (`clean`, `build`, `postbuild`, `compile`, `watch`, `generate`, `start:umbraco`, `inspect`, `test`, `test:evals`, `test:all`, `test:e2e`, `dev:worker`, `deploy:worker`):

```
"test:one": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --forceExit",
"test:changed": "node scripts/test-changed.mjs",
"test:rerun-failures": "<see item B above>",
"umbraco:bootstrap": "bash scripts/bootstrap-demo-site.sh",
"umbraco:start": "bash scripts/bootstrap-demo-site.sh && dotnet run --project demo-site",
"start:umbraco": "npm run umbraco:start",
"umbraco:stop": "lsof -ti :44391 | xargs kill 2>/dev/null; lsof -ti :56472 | xargs kill 2>/dev/null"
```
Notes:
- `test:one` uses `--forceExit` — this project's plain `test` script doesn't, and this session hit exactly the failure mode `--forceExit` guards against (an open TLS handle / chained-MCP child process keeping Jest from exiting after a single-file run). Worth adding regardless of anything else in this list.
- `umbraco:stop` is a real quality-of-life gap: this session repeatedly had to manually `ps aux | grep demo-site` and `kill`/`kill -9` the demo-site process by hand across several restarts. This one-liner would have saved that every time. Update the ports to `44448`/`44449` (this project's demo-site ports) when porting.
- Their `test:all` is `npm run build && npm run test && npm run test:evals` — no separate `compile` step (their `build` presumably fails loud enough on type errors). This project's current `test:all` differs slightly; worth reconciling once eval tests are actually fixed and worth running as part of `test:all`.
- `umbraco:start`/`umbraco:bootstrap`/`start:umbraco` depend on item D below (`bootstrap-demo-site.sh` + `demo-site-template/`) existing first.

### D. `scripts/bootstrap-demo-site.sh`

Not present in this project (`scripts/start-umbraco.sh` here is currently a stub that just errors telling you to run `create-umbraco-mcp-server init`, which doesn't scaffold Engage-specific packages — this session had to build `demo-site/` entirely by hand instead). Current full content:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Creates a working demo-site/ by copying demo-site-template/ into it.
# demo-site-template/ is the tracked source of truth; demo-site/ is
# gitignored and represents each developer/CI's actual running instance.
#
# Idempotent: skips the copy if demo-site/ already exists unless --force.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$PROJECT_DIR/demo-site-template"
SITE_DIR="$PROJECT_DIR/demo-site"

FORCE=0
SQLITE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --sqlite) SQLITE=1 ;;
  esac
done

# Writes a server-less SQLite appsettings.local.json so Umbraco can boot
# without SQL Server / Docker.
write_sqlite_config() {
  cat > "$SITE_DIR/appsettings.local.json" <<'EOF'
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Data Source=|DataDirectory|/Umbraco.sqlite.db;Cache=Shared;Foreign Keys=True;Pooling=True",
    "umbracoDbDSN_ProviderName": "Microsoft.Data.Sqlite"
  }
}
EOF
}

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Error: $TEMPLATE_DIR does not exist" >&2
  exit 1
fi

if [ -d "$SITE_DIR" ] && [ "$FORCE" -eq 0 ]; then
  echo "demo-site/ already exists; skipping bootstrap (pass --force to overwrite)" >&2
  exit 0
fi

if [ "$FORCE" -eq 1 ] && [ -d "$SITE_DIR" ]; then
  echo "--force given; removing existing demo-site/" >&2
  rm -rf "$SITE_DIR"
fi

# rsync to preserve file modes, exclude build artefacts and runtime data
rsync -a \
  --exclude='bin/' \
  --exclude='obj/' \
  --exclude='umbraco/' \
  --exclude='wwwroot/' \
  --exclude='appsettings.local.json' \
  --exclude='appsettings.Local.json' \
  "$TEMPLATE_DIR/" "$SITE_DIR/"

# Rename csproj so the assembly name matches the folder
if [ -f "$SITE_DIR/demo-site-template.csproj" ]; then
  mv "$SITE_DIR/demo-site-template.csproj" "$SITE_DIR/demo-site.csproj"
fi

if [ "$SQLITE" -eq 1 ]; then
  if [ ! -f "$SITE_DIR/appsettings.local.json" ] || [ "$FORCE" -eq 1 ]; then
    write_sqlite_config
    echo "demo-site/appsettings.local.json written for server-less SQLite" >&2
  else
    echo "demo-site/appsettings.local.json already exists; leaving untouched (pass --force to overwrite)" >&2
  fi
fi

echo "demo-site/ created from demo-site-template/" >&2
echo "Next steps:" >&2
if [ "$SQLITE" -eq 1 ]; then
  echo "  - appsettings.local.json already written for server-less SQLite" >&2
else
  echo "  - Write demo-site/appsettings.local.json with your DB connection string" >&2
fi
echo "  - Run 'npm run umbraco:start'" >&2
```
Generic — no CMS-specific assumptions. The `--sqlite` flag directly eliminates the entire Docker + SQL Server container + manual `CREATE DATABASE` dance this session went through by hand this project would need only `demo-site-template/` (item E) to exist for this to work as-is.

### E. `demo-site-template/` — needs adapting, not copying verbatim

`cms-dev-mcp` has this tracked (`demo-site-template.csproj`, `Program.cs`, `appsettings.json`, `appsettings.Development.json`, `McpOAuthComposer.cs`, `Properties/launchSettings.json`, `Search/ExamineComposer.cs`, `.gitignore`) as the source of truth `bootstrap-demo-site.sh` copies from. **Caveat: their template currently pins `Umbraco.Cms 18.0.0`** (their own target version) **— not directly usable for this project as-is**, since `Umbraco.Engage 17.2.1` requires `Umbraco.Cms` in `[17.2.0, 18.0.0)` (confirmed this session; see [Upgrades §6](02-upgrades.md#6-umbracoengage-demo-site-version--already-resolved-this-session-flagging-the-tradeoff-for-the-future)), and their template also references a `clean` starter-kit package version that conflicted with 18.x — a conflict this project already hit and resolved by dropping `Clean` entirely for 17.x this session.

**Action:** create `demo-site-template/` here by adapting their template — swap `Umbraco.Cms`/`Umbraco.Cms.DevelopmentMode.Backoffice` to `17.6.0`, add `Umbraco.Engage 17.2.1`, omit `Clean`/`Umbraco.ExaminePDF`/`Swashbuckle.AspNetCore` unless a real need appears. Their `Program.cs` also adds `.AddDeliveryApi()` to the builder chain (this project's hand-built `demo-site/Program.cs` doesn't) and loads `appsettings.Local.json` (capital L) conditionally on `!IsProduction()`, vs. this project's unconditional lowercase `appsettings.local.json` load — worth reconciling either way, not just copying blindly.

### F. `.github/workflows/test.yml`

This project has no `.github/` directory at all. Their `test.yml` runs two jobs:
- **`test`**: compile → build → `dotnet dev-certs https --trust` → `bootstrap-demo-site.sh` (their CI job does **not** use `--sqlite` — it spins up a real SQL Server service container and writes `appsettings.Local.json` with a SQL Server connection string instead, despite the script supporting SQLite; the flag appears to be for fast local dev only) → boot Umbraco backgrounded with PID tracking → **poll the `serverStatus` field from `/umbraco/management/api/v1/server/status` until it equals `"Run"`** (far more precise than a generic HTTP-200 poll — a real find worth adopting on its own even independent of the rest of the workflow) with a process-liveness check and log tail on failure → create the API user via `scripts/create-api-user.mjs` (**use this project's already-fixed redirect-URI version**, not theirs — see Correction #3 above) → `npm test` → on failure, dump `test-failures.log` to `$GITHUB_STEP_SUMMARY` (ties to item B) → Playwright e2e.
- **`evals`**: same boot sequence, gated to PRs where `base == main && head starts with 'release/'`, needs `ANTHROPIC_API_KEY` from repo secrets. Don't port this job until [Testing Improvements §2/§2a](01-testing-improvements.md#2-rewrite-the-eval-tests-against-real-tool-names) is actually done — no point running a gated eval CI job against tools that don't exist and a harness that crashes.

### G. `.github/dependabot.yml`

Not present in this project. Current content (this file changed while this doc was being drafted — cadence was simplified from monthly+grouped to weekly, dropping an `ignore` rule that had existed for `@modelcontextprotocol/inspector`'s major-version updates):
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    target-branch: dev
    open-pull-requests-limit: 10
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
    target-branch: dev
```
Note `target-branch: dev` — this project currently only has `main` (it was git-initialized from scratch this session with no gitflow branches yet). Either adopt a `dev`/`main` split to match, or point `target-branch` at `main` directly; don't copy the branch name without deciding that first.

### H. `scripts/test-changed.mjs`

Not present in this project. Git-diff-aware `jest --findRelatedTests` pre-flight, written for the org's automated issue-loop tooling but generically useful for fast local iteration: resolves the diff base (`GITHUB_BASE_REF` → `origin/dev` → `dev` → `origin/main` → `main`, falling through to whichever exists), runs `--findRelatedTests` over changed non-test `.ts` files under `src/` plus any changed `*.test.ts` files directly, exits 0 cleanly when nothing matches (e.g. a docs-only change). Directly portable as-is — its branch-fallback chain already degrades gracefully to `main` for a repo (like this one, today) that has no `dev` branch yet.

### I. `CLAUDE.md` + `.rulesync/rules/*.md` — structure worth adopting, one piece of *content* is a real bug-risk finding

Their root `CLAUDE.md` is a thin index (132 lines) pointing into `.rulesync/rules/` — 5 files, ~1385 lines total (`cursor-mcp.md`, `cursor-mcp-testing.md`, `cursor-model-context-provider-typescript.md`, `cursor-project-context.md`, `schema-flattening-addition-for-folders.md`) — rather than one large flat file. This project's `CLAUDE.md` (195 lines after this session's additions) has no equivalent split, and its header is still unmodified template boilerplate (see [Upgrades §7](02-upgrades.md#7-documentation-debt-not-a-dependency-but-adjacent)).

**One specific, verified, real finding from this structure worth acting on regardless of whether the doc split itself gets adopted:**

`cms-dev-mcp` generates its Orval output schemas with `zod.guid()` instead of `zod.uuid()` — confirmed by direct inspection: `1163` occurrences of `zod.guid()` and `0` occurrences of `zod.uuid()` in their generated `umbracoManagementAPI.zod.ts`. This project's generated `umbracoEngageManagementApi.zod.ts` has the exact opposite: `605` occurrences of `zod.uuid()`, `0` of `zod.guid()`. The reason, verified in their code (`src/umbraco-api/tools/__tests__/guid-not-uuid.test.ts`):

> Umbraco uses GUIDs that are not RFC 4122 compliant UUIDs. For example, document version IDs are sequential integers packed into GUID format (e.g. `0000003f-0000-0000-0000-000000000000`). Zod's `uuid()` enforces RFC 4122 version/variant bits and rejects these.

Their fix is a shared, published SDK feature — `postProcessZodFiles`, exported from `@umbraco-cms/mcp-server-sdk/orval` (implemented in `umbraco-mcp-base/packages/mcp-server-sdk/src/orval/orval-zod-post-process.ts`), wired into their `orval.config.ts` as a Zod-generation `afterAllFilesWrite` hook, and guarded by a dedicated test asserting the replacement actually happened.

**This project's installed SDK version (`17.0.0-beta.28`) does not export `postProcessZodFiles` at all** — confirmed: `@umbraco-cms/mcp-server-sdk`'s `package.json` has no `./orval` subpath export, and its main `index.d.ts` only exports `orvalImportFixer`. This is **not portable by copying code** — it requires the SDK version upgrade covered in [Upgrades §2](02-upgrades.md#2-umbraco-cmsmcp-server-sdk-and-umbraco-cmsmcp-hosted) before it can be adopted. Flagging it here because it's a concrete, currently-live risk: if Umbraco/Engage ever returns a non-RFC4122 GUID in any Engage tool's response (plausible — Umbraco's own core does this, per the comment above), that tool's output schema validation will throw, and there is currently zero test coverage in this project that would catch it before a user does. Once the SDK is upgraded, port both the `orval.config.ts` hook wiring and a `guid-not-uuid.test.ts`-equivalent regression test.

Other structural content in `.rulesync/` worth adopting the *pattern* of (not quoted in full here — read directly when doing this work): a PR/CI discipline section (don't consider a task done at push time; poll `gh pr checks`, read failed-check logs via `gh run view --log-failed`, fix, push, loop until green) and a stale-test-data/DB-recycling runbook (recreate the API user after any DB recycle — directly relevant given this project's own `scripts/create-api-user.mjs` exists for exactly that reason).

## Not portable / already equivalent

`src/config/mode-registry.ts` and `slice-registry.ts` in `cms-dev-mcp` follow the same pattern shape as this project's — no drift in convention, nothing to port. Not independently investigated in this pass: whether `cms-dev-mcp`'s tool files use an `enabled: (user) => user.fallbackPermissions.includes(...)` permission-gating callback convention this project's tools don't yet — flagged as a follow-up, not confirmed either way.
