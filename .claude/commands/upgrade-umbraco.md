# /upgrade-umbraco

Upgrade the demo-site's Umbraco CMS and/or Umbraco Engage packages to a newer released version, regenerate the API client, identify schema/endpoint impact on tools and tests, and surface new endpoints for tool creation.

## Usage

```
/upgrade-umbraco                   # upgrade both Umbraco.Cms and Umbraco.Engage to latest stable
/upgrade-umbraco engage 17.3.0     # upgrade only Umbraco.Engage to a specific version
/upgrade-umbraco cms 17.7.0        # upgrade only Umbraco.Cms (and DevelopmentMode.Backoffice) to a specific version
```

ARGUMENTS: $ARGUMENTS

## Prerequisites

- Local SQL Server reachable from `demo-site/appsettings.local.json`
- A working `.env` with `UMBRACO_CLIENT_ID`, `UMBRACO_CLIENT_SECRET`, `UMBRACO_BASE_URL`
- `dotnet`, `npm`, `curl`, `python3` on PATH
- The `umbraco-back-office-mcp` OAuth client must already exist in the target database (created via `scripts/create-api-user.mjs`, see CLAUDE.md's API User Setup section). Reuse the same DB across upgrades so the client persists; Umbraco will run forward migrations automatically.

## Steps

### 1. Set up an isolated worktree

```bash
git worktree add .claude/worktrees/upgrade-umbraco-<version> -b chore/upgrade-umbraco-<version> dev
cd .claude/worktrees/upgrade-umbraco-<version>
npm install
npm run compile   # confirm a clean baseline before changing anything
```

Copy `.env` into the worktree (gitignored, won't come across automatically).

### 2. Identify the target version(s)

If no argument is given, query NuGet for the latest non-prerelease of each package:

```bash
curl -s "https://api.nuget.org/v3-flatcontainer/umbraco.cms/index.json" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
      print(next(v for v in reversed(d['versions']) \
      if not any(x in v for x in ['rc','beta','alpha','pre'])))"

curl -s "https://api.nuget.org/v3-flatcontainer/umbraco.engage/index.json" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
      print(next(v for v in reversed(d['versions']) \
      if not any(x in v for x in ['rc','beta','alpha','pre'])))"
```

**Check compatibility before bumping either package independently**: Engage pins a supported `Umbraco.Cms.Web.Website` dependency range in its own nuspec (`Umbraco.Engage.Core`). Don't bump `Umbraco.Cms` past what the target `Umbraco.Engage` version supports, and vice versa — CLAUDE.md's Demo Site Setup section documents `17.6.0` + `17.2.1` as the last confirmed-working pair. Also confirm the matching version of `Umbraco.Cms.DevelopmentMode.Backoffice` (kept in lockstep with `Umbraco.Cms`).

### 3. Update package versions in the template

Edit `demo-site-template/demo-site-template.csproj`:

```xml
<PackageReference Include="Umbraco.Cms" Version="X.Y.Z" />
<PackageReference Include="Umbraco.Cms.DevelopmentMode.Backoffice" Version="X.Y.Z" />
<PackageReference Include="Umbraco.Engage" Version="A.B.C" />
```

`demo-site/` is gitignored — it is regenerated from the template by the bootstrap script.

### 4. Boot the upgraded Umbraco

```bash
npm run umbraco:stop   # in case anything was running
bash scripts/bootstrap-demo-site.sh --force
# Make sure demo-site/appsettings.local.json has the same DB you used previously
npm run umbraco:start  # NuGet restore, build, run forward migrations, listen on 44448/44449
```

Wait until `https://localhost:44448/umbraco` responds. Watch the startup log for migration messages so you know the schema upgraded cleanly.

### 5. Regenerate the OpenAPI client

`orval.config.ts` uses a literal `{port}` placeholder in both `target` URLs — replace it with `44448` (or edit temporarily) before running:

```bash
npm run generate       # orval reads https://localhost:44448/umbraco/swagger/engage-management/swagger.json
npm run compile        # catch type-level breakages immediately
```

The `afterAllFilesWrite` hooks (`orvalImportFixer`, `relaxUuidToGuid` from `@umbraco-cms/mcp-server-sdk/orval`) rewrite imports and relax `zod.uuid()` → `zod.guid()` in the generated `*.zod.ts` file automatically — don't hand-edit generated output to work around either.

### 6. Diff the regenerated API surface

`src/umbraco-api/api/generated/umbracoEngageManagementApi.ts` ends in a single `return {fnA,fnB,...}` line listing every generated client function — diff that line before/after:

```bash
git show HEAD:src/umbraco-api/api/generated/umbracoEngageManagementApi.ts \
  | grep -oE "^return \{.*\}" | tr ',' '\n' | sed 's/[{}]//g' | sort -u > /tmp/api-old-fns.txt
grep -oE "^return \{.*\}" src/umbraco-api/api/generated/umbracoEngageManagementApi.ts \
  | tr ',' '\n' | sed 's/[{}]//g' | sort -u > /tmp/api-new-fns.txt
echo "--- NEW endpoints ---"
comm -23 /tmp/api-new-fns.txt /tmp/api-old-fns.txt
echo "--- REMOVED endpoints ---"
comm -13 /tmp/api-new-fns.txt /tmp/api-old-fns.txt
```

Also inspect `git diff` on `umbracoEngageManagementApi.zod.ts` for field-level changes in existing schemas (additive fields, new enum values, deprecation markers).

### 7. Fix compile-only breakages

Existing tests sometimes break because a previously-implicit query parameter became required at the type level. The convention here is to pass `field: undefined` in the test object literal — match the pattern used for other optional params in the same file.

If the breakage is structural (a removed endpoint, a renamed field used in tool implementations), fix the offending tool/test and explain the fix in the PR description.

### 8. Run the integration tests

```bash
rm -f test-failures.log
npm test
```

Failures fall into three buckets:

1. **Snapshot drift** — additive fields, deprecated markers, or new enum values changed the response shape. Leave these for the user to review and accept via `npm test -- -u` (only the affected files, not the whole suite blindly).
2. **Type-level breakages from new optional params** — fix per step 7 (add `field: undefined`).
3. **Real regressions** — tool no longer matches the API contract. Investigate and fix the tool.

`npm run test:rerun-failures` reruns just the suites listed in `test-failures.log`.

**Known pitfall:** `package/__tests__/get-package.test.ts` snapshots the exact Engage version string (`version: "17.2.1+cb3108d"` as of writing — see CLAUDE.md's Demo Site Setup section). A version bump *always* fails this snapshot on the version field alone; that's expected, not a regression — accept it along with the rest.

### 9. Plan and add tools for new endpoints

For each new endpoint identified in step 6, decide:

- Is it covered by an existing tool, just with a different shape (e.g. a lightweight `items` list vs a full detail response)? Both may be worth keeping.
- Is it a meaningful new capability for an LLM caller?

When adding tools, follow the conventions in `src/umbraco-api/tools/<entity>/{get,post,put,delete}/`, registered in the entity's `index.ts` — use `withStandardDecorators`, set `slices` (see `src/config/slice-registry.ts`) and `annotations`. Prefer the `umbraco-mcp-skills:add-tool` skill/agent over hand-authoring when the endpoint fits an existing collection.

After each tool, add an integration test under `src/umbraco-api/tools/<entity>/__tests__/` (use `umbraco-mcp-skills:add-test`). Follow CLAUDE.md's Testing section for which fixture pattern applies:

- **Engage-native entity** (A/B tests, personas, segments, …) — seed via `getUmbracoEngageManagementAPI()` directly in a builder, no chaining.
- **CMS-native entity** that Engage only reads (content types, documents, domains) — seed via the chained CMS MCP (`mcpClientManager.callTool("cms", ...)`), see `content-types/__tests__/helpers/document-type-fixture.ts`.
- Watch for volatile fields (timestamps, run ids, `createdByUmbracoUserName`, background-job counts) — normalize via `normalizeVolatileFields()` or skip snapshotting entirely per CLAUDE.md's guidance, rather than fighting CI flakiness after the fact.

### 10. Report and hand off

When tests are green (or only have snapshot diffs), summarize:

- Old → new version(s) for `Umbraco.Cms` and `Umbraco.Engage`
- New endpoints (with the resulting new tool names, if any added)
- Removed endpoints (must always be addressed, as tools depending on them will fail)
- Modified response schemas worth flagging (deprecated fields, additive fields)
- List of tests with snapshot drift the user should review

Then follow this repo's PR / CI Workflow (CLAUDE.md): push the branch, open a PR against `dev`, and watch `.github/workflows/test.yml` to green before reporting done.

## Common pitfalls

- **Fresh database:** A brand-new DB will not have `umbraco-back-office-mcp` registered; integration tests will 401. Reuse the developer DB or re-run `scripts/create-api-user.mjs` once against it.
- **Two ports:** `44448` (HTTPS) is the browser/OAuth port; `44449` (HTTP) is the server-to-server port. Both must be listening — `launchSettings.json` pins both, don't override with `--urls`.
- **`{port}` placeholder in `orval.config.ts`:** it's literal text, not a template variable — must be hand-replaced (or scripted around) before `npm run generate` will resolve a URL.
- **`zod.uuid()` vs `zod.guid()`:** Umbraco's GUIDs aren't RFC 4122 compliant. The `relaxUuidToGuid` hook handles this for generated output schemas automatically — hand-written tool *input* schemas should keep using `uuid()` directly (per `orval.config.ts`'s own comment).
- **`demo-site/` is gitignored:** always edit `demo-site-template/`; the site directory is rebuilt by `scripts/bootstrap-demo-site.sh`.
- **Snapshot updates:** don't run `-u` blindly across the whole suite — review diffs per-file so a real regression doesn't get silently accepted as drift.
