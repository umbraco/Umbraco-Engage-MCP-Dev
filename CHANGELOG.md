# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- On an Umbraco Engage older than 17.5.0, the server now warns at startup (on stderr and in the MCP
  `instructions`), and the 31 tools whose Engage API changed (A/B tests, applied personalization,
  analytics queries, configuration and a few others) return an error naming the required version
  instead of calling Engage. Other tools are unaffected, and if the Engage version can't be read
  nothing is blocked.

### Changed

- **Breaking:** the package is renamed from `@umbraco-engage/mcp-dev` to `@umbraco-engage/mcp`, and
  its CLI command from `umbraco-engage-mcp-dev` to `engage-mcp-server` (matching `forms-mcp-server`
  and `automate-mcp-server`). Update MCP client configs and scripts that name the old package or command.
- Upgraded `@umbraco-cms/mcp-server-sdk` and `@umbraco-cms/mcp-hosted` to `1.0.0-beta.48`:
  - In dry-run mode, write tools return a preview and no longer advertise an output schema.
  - Environment variables (including an MCP client's `env` block) now take precedence over `./.env`;
    a file passed with `--env <path>` still overrides both.
  - The hosted server accepts only S256 PKCE.
- **Breaking:** requires Umbraco Engage 17.5.0 or later. Engage 17.5.0 changed its Management API
  (A/B tests and applied personalization reference goals, projects and segments by key), and the
  tools now follow it. Earlier 17.x releases aren't supported.

### Removed

- **Breaking:** the `get-ab-test-preview-url` and `delete-segments-delete-segment-content` tools,
  because Engage 17.5.0 removed their endpoints.

## [17.0.0-beta.2] - 2026-09-11

### Fixed

- The `17.0.0-beta.1` npm publish failed with `403 Forbidden`: the CI npm credentials are
  scoped to the `@umbraco-engage`/`@umbraco-cms` npm orgs and reject unscoped package names.
  Renamed the package from `umbraco-engage-editor-mcp` to `@umbraco-engage/mcp-dev` (matching
  the existing `@umbraco-engage/backoffice` and `@umbraco-cms/mcp-dev` scoping convention) so
  the publish is authorized. The CLI binary is now `umbraco-engage-mcp-dev`; the MCP server's
  own protocol-level `name` (used in tool-call prefixes) is unchanged.

## [17.0.0-beta.1] - 2026-09-10

### Changed

- Realigned the package version scheme with the Umbraco CMS major version it targets
  (CMS 17.x), moving from `1.0.0-alpha.x` to `17.0.0-beta.x`.
- Enabled the public npm beta release stage in the Azure Pipelines build; the package
  now also publishes to the public npm registry under the `beta` dist-tag, in addition
  to the existing MyGet prerelease feed.
- Security rollup: bumped `qs` (6.15.3 → 6.16.0), `fast-uri` (3.1.5 → 3.1.7), and `hono`
  (4.13.3 → 4.13.7) to address upstream advisories.

## [1.0.0-alpha.2] - 2026-09-08

### Added

- A/B test lifecycle tools: `post-ab-test-start` / `post-ab-test-stop`.
- Claude Code plugin bundling CLI/setup skills and content-structure recipes.

### Fixed

- Proxied chained tools now expose their real input schema instead of a generic one.
- `post-ab-test` now exposes `projectId` and pins the `SplitUrl` page correctly.
- Root-caused and documented the real cause of `post-ab-test-segment`'s 400 response.

### Removed

- Cockpit, cockpit-auth, and data-generation tool collections.

### Changed

- Upgraded Orval from 7.8 to 8.28.1 and regenerated the API client.
- Aligned dependencies with `umbraco-mcp-dev-forms`; fixed the Jest 30 CLI flag rename.
- Strengthened list tests to use real entities instead of fragile full-list snapshots.
- Rebuilt the eval suite as persona-driven workflow tests.
- Ported portable Jest/build fixes and the upgrade playbook from `umbraco-mcp-dev-cms`.

## [1.0.0-alpha.1] - 2026-08-24

Initial prerelease of the Umbraco Engage MCP server.

### Added

- MCP server exposing Umbraco Engage tools (A/B testing, personalization, personas,
  segments, content scoring, traffic filters, campaign groups, cockpit auth, and more)
  generated from the Engage Management API via Orval.
- Chained-MCP support for CMS-native entities (content types, documents, domains).
- Full integration test suite running against a real Umbraco + Engage instance,
  split per tool collection to keep CI memory bounded.
- LLM eval test suite for tool-selection acceptance testing.
- Demo site bootstrap tooling (`demo-site-template/`) and API user provisioning script.
- CI workflow provisioning SQL Server, bootstrapping the demo site, and running the
  full integration suite on every push/PR.
- Azure Pipelines build publishing prerelease packages to the private MyGet feed.
- Automated `v<version>` tagging and GitHub Release creation on merges to `main`.
