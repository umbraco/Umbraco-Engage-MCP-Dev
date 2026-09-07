---
name: umb-engage-dev-cli
description: Guide for running and debugging the Umbraco Engage MCP server via the CLI. Use when the user wants to list tools, call tools, configure filtering, dry-run, readonly mode, or debug configuration.
---

# Umbraco Engage MCP Server — CLI Guide

This MCP server runs as a CLI tool. The CLI handles authentication and configuration, then exposes tools that talk directly to the Umbraco Engage Management API — and, by default, chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), proxying its tools with a `cms:` prefix (e.g. `cms:get-document`).

## Detecting the CLI Command

Determine the CLI command in a single check:

```bash
# One command to detect context — check for local build AND .env together
ls dist/index.js .env 2>/dev/null
```

- If `dist/index.js` exists (working in this repo): use `node dist/index.js`
- Otherwise (using the published package): use `npx umbraco-engage-editor-mcp@latest`

All examples below use `<cli>` as a placeholder — substitute the correct command.

## Quick Reference

```bash
# List all tools (Engage tools plus proxied cms: tools)
<cli> --list-tools

# Describe a specific tool's schema
<cli> --describe-tool <tool-name>

# Call a tool directly (requires auth via .env)
<cli> --call <tool-name> --call-args '{"key":"value"}'

# Generate context documentation
<cli> --generate-context > CONTEXT.md

# Debug resolved configuration
<cli> --debug-config
```

## Authentication

**Never pass secrets as CLI arguments.** Use a `.env` file.

| Env Var | Required | Description |
|---------|----------|-------------|
| `UMBRACO_CLIENT_ID` | Yes | OAuth client ID from Umbraco API user |
| `UMBRACO_CLIENT_SECRET` | Yes | OAuth client secret |
| `UMBRACO_BASE_URL` | Yes | Umbraco instance URL |

Create a `.env` file:
```
UMBRACO_CLIENT_ID=your-client-id
UMBRACO_CLIENT_SECRET=your-secret
UMBRACO_BASE_URL=https://localhost:44391
```

The API user needs access to the **Engage** section, plus **Content** (and any other CMS sections in use) if the chained `cms:` tools will be called too.

Introspection commands (`--list-tools`, `--describe-tool`, `--generate-context`) do not require auth.

## Tool Filtering

| Flag | Env Var | Description |
|------|---------|-------------|
| `--umbraco-tool-modes` | `UMBRACO_TOOL_MODES` | Enable named groups of collections |
| `--umbraco-include-slices` | `UMBRACO_INCLUDE_SLICES` | Only expose tools with these slices |
| `--umbraco-exclude-slices` | `UMBRACO_EXCLUDE_SLICES` | Hide tools with these slices |
| `--umbraco-include-tool-collections` | `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | Only expose these collections |
| `--umbraco-exclude-tool-collections` | `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` | Hide these collections |
| `--umbraco-include-tools` | `UMBRACO_INCLUDE_TOOLS` | Only expose these specific tools |
| `--umbraco-exclude-tools` | `UMBRACO_EXCLUDE_TOOLS` | Hide these specific tools |

Filter flags apply to the Engage collections below AND pass through to the chained CMS server's own collections. Exclude takes precedence over include; filters combine.

Slices are defined in [`src/config/slice-registry.ts`](https://github.com/umbraco/Umbraco-Engage-MCP-Dev/blob/main/src/config/slice-registry.ts) — the single source of truth (currently: `create`, `read`, `update`, `delete`, `list`, `search`). Tools with no slices assigned fall back to `other`.

### Modes

Modes are named groups that enable related collections together. Set `UMBRACO_TOOL_MODES` to one or more mode names — see [`src/config/mode-registry.ts`](https://github.com/umbraco/Umbraco-Engage-MCP-Dev/blob/main/src/config/mode-registry.ts) for the source of truth:

| Mode | Collections |
|---|---|
| `ab-testing` | `ab-test`, `ab-test-project`, `ab-test-variant` |
| `analytics` | `analytics`, `reporting`, `statistics`, `search-terms`, `heatmaps` |
| `personalization` | `persona`, `segments`, `applied-personalization`, `customer-journey` |
| `campaigns` | `campaigns`, `campaign-group`, `goal`, `goals`, `annotations` |
| `scoring` | `content-scoring`, `referral-scoring`, `referral-group` |
| `profiles` | `profile` |
| `administration` | `configuration`, `main-switch`, `package`, `add-ons`, `cultures`, `content-types`, `document-type-permissions`, `user-group-permissions`, `data-cleanup`, `traffic-filter`, `suspicious-activity` |

For example, `<cli> --umbraco-tool-modes ab-testing,personalization` exposes exactly the collections needed to build the recipes in the `umb-engage-content-recipes` skill.

## Runtime Modes

### Readonly mode
```bash
<cli> --umbraco-readonly
```
Mutation tools are completely removed — the LLM won't see them at all. Applies to the chained `cms:` tools too.

### Dry-run mode
```bash
<cli> --umbraco-dry-run
```
Read tools execute normally. Mutation tools return a preview without calling the API.

## Disabling CMS Chaining

```bash
<cli> --disable-mcp-chaining
```
Or set `DISABLE_MCP_CHAINING=true`. Use this if the AI client already has a separate CMS MCP connection and the proxied `cms:` tools would just be duplicates.

## Introspection Commands

These print output and exit immediately — they do not start the MCP server.

| Flag | Description |
|------|-------------|
| `--list-tools` | Print ASCII table of all tools |
| `--describe-tool <name>` | Print full JSON schema for a tool |
| `--generate-context` | Output CONTEXT.md documenting all tools |
| `--debug-config` | Print resolved config (secrets masked) |
| `--call <name>` | Call a tool directly, print JSON result |
| `--call-args <json>` | JSON arguments for `--call` (default: `{}`) |

Introspection respects all filtering. `--list-tools` with `UMBRACO_READONLY=true` shows exactly what the LLM would see.

## Efficient CLI Usage

Every CLI call costs time and tokens. The CLI has built-in filtering so you don't need to fetch everything and grep locally.

**1. Filter server-side, not locally.**
```bash
# Bad — fetches all tools then filters locally
<cli> --list-tools | grep goal

# Good — server returns only what you need
<cli> --list-tools --umbraco-include-tool-collections goal,goals
```

**2. Use search/find tools before tree traversal.** e.g. prefer `cms:search-document` over walking the CMS content tree, and `get-goal-all-types`/`get-goals-all` over paging through unrelated collections.

**3. Batch independent shell commands.**
```bash
# Good — one call
ls dist/index.js .env 2>/dev/null
```

**4. Use `--describe-tool` before guessing parameters.** Several Engage write tools (`post-ab-test`, `post-goal`, `post-applied-personalization`) build a larger server payload from a smaller input — check the schema rather than guessing field names.

For end-to-end sequences (project → goal → A/B test → variant, or persona → segment → applied personalization), see the `umb-engage-content-recipes` skill.

## Input Sanitization

The SDK validates all string inputs before tool handlers run:
- Rejects control characters, path traversal (`../`), embedded query params, percent-encoded strings
- Validates UUID format where expected
- Returns clear error messages for agent self-correction
