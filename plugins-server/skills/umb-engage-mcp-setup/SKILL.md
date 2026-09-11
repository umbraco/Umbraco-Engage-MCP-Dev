---
name: umb-engage-mcp-setup
description: Guide for installing and configuring the Umbraco Engage MCP server (@umbraco-engage/mcp-dev) as a live MCP connection in an AI client. Use when the user wants to set up, connect, install, or troubleshoot the Engage MCP server itself (as opposed to running it standalone via the CLI).
---

# Umbraco Engage MCP Server — Setup Guide

This covers running `@umbraco-engage/mcp-dev` as a live MCP server connected to an AI client (Claude Desktop, Claude Code, Cursor, VS Code, etc). For debugging the package directly on the command line (`--list-tools`, `--call`, `--debug-config`), see the `umb-engage-dev-cli` skill instead — the same env vars apply either way. For end-to-end examples of building A/B tests and personalization once connected, see `umb-engage-content-recipes`.

[Umbraco Engage](https://umbraco.com/products/umbraco-engage/) is a marketing/analytics/personalization add-on for Umbraco CMS. This MCP server talks to Engage's own Management API, and by default also chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), proxying its tools with a `cms:` prefix — so a single connection gives an agent both Engage and CMS capabilities.

## Prerequisites

- An Umbraco CMS instance with Umbraco Engage installed, reachable over HTTPS (or HTTP on a local network).
- Node.js 22 or later if the client itself needs to run `npx` — most desktop clients bundle their own Node runtime, so this mainly matters if you're invoking the server manually.
- An Umbraco API user with access to the **Engage** section (and any CMS sections the agent should touch via the chained `cms:` tools — typically **Content**). See [Umbraco's API user documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users). You'll come away with a **client ID** and **client secret**; treat the secret like a password (never commit it, never paste it into chat).

## Coding Environments: `.mcp.json`

When the client is a coding agent working against a project (Claude Code, Cursor, VS Code, etc.), the preferred setup is a project-scoped MCP config file — e.g. `.mcp.json` for Claude Code — rather than a global/user-level config, so the server definition can be checked in and shared across the team without each developer's real secrets:

```json
{
  "mcpServers": {
    "umbraco-engage": {
      "command": "npx",
      "args": ["@umbraco-engage/mcp-dev"],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "0",
        "UMBRACO_CLIENT_ID": "your-api-user-id",
        "UMBRACO_CLIENT_SECRET": "your-api-secret",
        "UMBRACO_BASE_URL": "https://localhost:{port}"
      }
    }
  }
}
```

Keep real `UMBRACO_CLIENT_ID` / `UMBRACO_CLIENT_SECRET` values out of any file that gets committed — use a local, git-ignored env file or your client's secret-reference mechanism instead of hardcoding them in a checked-in `.mcp.json`.

`NODE_TLS_REJECT_UNAUTHORIZED=0` is only for local instances with self-signed certs — never set it against a production/public base URL.

Restart the client after saving the configuration.

## Required and Optional Environment Variables

| Env Var | Required | Description |
|---------|----------|--------------|
| `UMBRACO_CLIENT_ID` | Yes | OAuth client ID from the Umbraco API user |
| `UMBRACO_CLIENT_SECRET` | Yes | OAuth client secret — keep this out of chat, source control, and screenshots |
| `UMBRACO_BASE_URL` | Yes | Base URL of the Umbraco instance, e.g. `https://localhost:44448` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | No | Set to `0` only for local instances with self-signed certs |
| `UMBRACO_TOOL_MODES` | No | Comma-separated named modes — presets that enable a curated set of collections (see below) |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | No | Comma-separated collections to expose — narrows the toolset the client loads |
| `UMBRACO_READONLY` | No | `true` removes all mutation tools — the LLM never sees them |
| `UMBRACO_DRY_RUN` | No | `true` lets mutation tools run and return a preview without calling the API |
| `UMBRACO_INCLUDE_SLICES` / `UMBRACO_EXCLUDE_SLICES` | No | Comma-separated slices — only expose (or hide) tools whose operation kind matches |
| `DISABLE_MCP_CHAINING` | No | `true` disables the automatic chained CMS MCP server and its `cms:`-prefixed tools |

## Modes and Slices

Beyond collections (`ab-test`, `persona`, `goal`, etc.), the server supports two more ways to shape which tools a client sees:

**A mode is a named preset that maps to a fixed set of collections** — a shortcut for "give me everything related to X" instead of listing collections by hand via `UMBRACO_INCLUDE_TOOL_COLLECTIONS`:

| Mode | Collections |
|---|---|
| `ab-testing` | `ab-test`, `ab-test-project`, `ab-test-variant` |
| `analytics` | `analytics`, `reporting`, `statistics`, `search-terms`, `heatmaps` |
| `personalization` | `persona`, `segments`, `applied-personalization`, `customer-journey` |
| `campaigns` | `campaigns`, `campaign-group`, `goal`, `goals`, `annotations` |
| `scoring` | `content-scoring`, `referral-scoring`, `referral-group` |
| `profiles` | `profile` |
| `administration` | `configuration`, `main-switch`, `package`, `add-ons`, `cultures`, `content-types`, `document-type-permissions`, `user-group-permissions`, `data-cleanup`, `traffic-filter`, `suspicious-activity` |

Set `UMBRACO_TOOL_MODES` to a comma-separated list to enable more than one, e.g. `UMBRACO_TOOL_MODES=ab-testing,personalization`.

**A slice is the operation kind a tool performs** (its verb), independent of which collection it belongs to — `create`, `read`, `update`, `delete`, `list`, `search`. Slice filtering cuts across collections, e.g. `UMBRACO_INCLUDE_SLICES=read,list` exposes only read/list tools across every enabled collection. Tools with no slices assigned fall back to `other`.

Modes, slices, and the collection/tool include-exclude filters all combine (exclude always wins over include), and all of them pass through to the chained CMS server too.

For the CLI flag equivalents of these same env vars and the remaining filtering variables (`UMBRACO_INCLUDE_TOOLS`, `UMBRACO_EXCLUDE_TOOLS`), see the `umb-engage-dev-cli` skill's Tool Filtering table.

## CMS MCP Chaining

By default this server chains to the CMS MCP server, sharing the same API user credentials — all CMS tools appear proxied with a `cms:` prefix (e.g. `cms:get-document`, `cms:create-document`, `cms:publish-document`). This matters for Engage recipes: A/B tests and applied personalization both attach to real, published Umbraco content pages, which have to be found or created through the `cms:` tools rather than anything in the Engage tool set itself.

To disable chaining (e.g. if the client already has a separate CMS MCP connection configured), set `DISABLE_MCP_CHAINING=true`.

## Troubleshooting

- **Tool list looks empty or wrong** — run `--debug-config` via the `umb-engage-dev-cli` skill to see the fully resolved configuration (secrets masked) and confirm filters are combining the way you expect.
- **A write tool fails validation on a field that "looks" optional** — several Engage write tools build a larger server payload from your input and validate related fields together (e.g. `post-ab-test`'s `goalId` must resolve to the same goal described in its `goal` object). Use `--describe-tool` and check the `umb-engage-content-recipes` skill before assuming the tool itself is broken.
- **Self-signed cert errors against a local instance** — set `NODE_TLS_REJECT_UNAUTHORIZED=0` in the server's env block, never globally, and never against a public URL.
