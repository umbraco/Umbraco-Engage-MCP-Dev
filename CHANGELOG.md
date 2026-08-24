# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
