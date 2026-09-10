# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
