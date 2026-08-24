# Umbraco Engage MCP

[![Test](https://github.com/umbraco/Umbraco-Engage-MCP-Dev/actions/workflows/test.yml/badge.svg)](https://github.com/umbraco/Umbraco-Engage-MCP-Dev/actions/workflows/test.yml)

An MCP (Model Context Protocol) server for [Umbraco Engage](https://umbraco.com/products/umbraco-engage/) that enables AI-powered marketing, analytics, and personalization workflows. It provides comprehensive access to the Umbraco Engage Management API, allowing your AI agent to run A/B tests, query analytics, manage personas and segments, configure campaigns and goals, inspect visitor profiles, and more — all through natural conversation.

## Intro

The MCP server authenticates using an Umbraco API user, ensuring secure, permission-based access to the Umbraco Engage API. Credentials are provided via OAuth2 client credentials and used for every request to the Engage Management API.

It chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), proxying its tools with a `cms:` prefix. This gives your AI agent access to both Engage and CMS capabilities in a single session — useful when personalization, A/B tests, or campaigns need to reference real documents, media, or content types.

## Quick Start

### 1. Create an Umbraco API User

Create an Umbraco API user with appropriate permissions. You can find instructions in [Umbraco's documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

Grant the user access to the **Engage** section and any other sections the AI agent should be able to read or change (e.g. **Content** when chained CMS tools are in use).

### 2. Add to Your MCP Client

Add the server to your MCP client configuration (Claude Desktop, Cursor, VS Code, etc.):

```json
{
  "mcpServers": {
    "umbraco-engage": {
      "command": "npx",
      "args": ["umbraco-engage-editor-mcp"],
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

Restart your MCP client after saving the configuration.

For local development against a built copy of this repo, the bundled `.mcp.json` runs `node --env-file=.env ./dist/index.js` instead — credentials live in `.env` and the server picks them up automatically when Claude Code opens the project.

## Configuration

All settings can be provided as environment variables or CLI flags.

### Connection

| Variable | CLI Flag | Purpose |
|---|---|---|
| `UMBRACO_CLIENT_ID` | `--umbraco-client-id` | OAuth client ID |
| `UMBRACO_CLIENT_SECRET` | `--umbraco-client-secret` | OAuth client secret |
| `UMBRACO_BASE_URL` | `--umbraco-base-url` | Umbraco instance URL |

### Tool Filtering

| Variable | CLI Flag | Purpose |
|---|---|---|
| `UMBRACO_TOOL_MODES` | `--umbraco-tool-modes` | Enable tool modes (comma-separated) |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | `--umbraco-include-tool-collections` | Include only these collections |
| `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` | `--umbraco-exclude-tool-collections` | Exclude these collections |
| `UMBRACO_INCLUDE_SLICES` | `--umbraco-include-slices` | Include only these slices |
| `UMBRACO_EXCLUDE_SLICES` | `--umbraco-exclude-slices` | Exclude these slices |
| `UMBRACO_INCLUDE_TOOLS` | `--umbraco-include-tools` | Include only these named tools |
| `UMBRACO_EXCLUDE_TOOLS` | `--umbraco-exclude-tools` | Exclude these named tools |
| `UMBRACO_READONLY` | `--umbraco-readonly` | Block all write operations |
| `DISABLE_MCP_CHAINING` | `--disable-mcp-chaining` | Disable CMS MCP server chaining |

### Modes

Modes are named groups that enable related collections together. Set `UMBRACO_TOOL_MODES` to one or more mode names:

| Mode | Collections |
|---|---|
| `ab-testing` | `ab-test`, `ab-test-project`, `ab-test-variant` |
| `analytics` | `analytics`, `reporting`, `statistics`, `search-terms`, `heatmaps` |
| `personalization` | `persona`, `segments`, `applied-personalization`, `customer-journey` |
| `campaigns` | `campaigns`, `campaign-group`, `goal`, `goals`, `annotations` |
| `scoring` | `content-scoring`, `referral-scoring`, `referral-group` |
| `profiles` | `profile` |
| `cockpit` | `cockpit`, `cockpit-auth` |
| `administration` | `configuration`, `main-switch`, `package`, `add-ons`, `cultures`, `content-types`, `document-type-permissions`, `user-group-permissions`, `data-cleanup`, `data-generation`, `traffic-filter`, `suspicious-activity` |

### Collections

| Collection | Tools | Description |
|---|---|---|
| `ab-test` | 11 | A/B test CRUD, pages, preview URL, runtime indication, view model |
| `ab-test-project` | 6 | A/B test project CRUD and details |
| `ab-test-variant` | 7 | Variants: create, disable, details, segment lookup |
| `add-ons` | 1 | Engage add-on metadata |
| `analytics` | 2 | Analytics distinct values and ad-hoc query endpoint |
| `annotations` | 6 | Global and page annotations CRUD |
| `applied-personalization` | 6 | Apply personalization to content and segments |
| `campaign-group` | 6 | Campaign groups, scored / unscored, visitors |
| `campaigns` | 1 | Campaign overview |
| `cockpit` | 2 | Engage Cockpit page info and cookie management |
| `cockpit-auth` | 2 | Cockpit auth domains and token generation |
| `configuration` | 1 | Engage configuration |
| `content-scoring` | 6 | Content scoring + customer journey / persona import/export |
| `content-types` | 2 | Content type metadata for segmented properties |
| `cultures` | 1 | Cultures supported by Engage |
| `customer-journey` | 7 | Customer journey CRUD, lock/unlock |
| `data-cleanup` | 3 | Data cleanup runs and logs |
| `data-generation` | 1 | Data generation logs |
| `document-type-permissions` | 3 | Document-type-level Engage permissions |
| `goal` | 4 | Goal types and goal details |
| `goals` | 2 | Goal listing (main and all) |
| `heatmaps` | 2 | Heatmap variants and scroll heatmap generation |
| `main-switch` | 3 | Engage main switch state and toggling |
| `package` | 1 | Engage package metadata |
| `persona` | 7 | Persona CRUD, lock/unlock, details |
| `profile` | 17 | Visitor profiles: details, sessions, page events, statistics, export |
| `referral-group` | 5 | Referral groups, visitors, CRUD |
| `referral-scoring` | 2 | Mark referrals as scored / unscored |
| `reporting` | 6 | Reporting generation, segment and goal performance |
| `search-terms` | 1 | Search terms report |
| `segments` | 7 | Segments CRUD, content assignment, priority, locations |
| `statistics` | 1 | Overall Engage statistics |
| `suspicious-activity` | 1 | Suspicious activity overview |
| `traffic-filter` | 5 | Traffic filter CRUD |
| `user-group-permissions` | 3 | User-group-level Engage permissions |

### Slices

Slices filter tools by operation type. Use `UMBRACO_INCLUDE_SLICES` or `UMBRACO_EXCLUDE_SLICES` with values like `create`, `read`, `update`, `delete`, `list`, `search`, and `other`.

For example, `UMBRACO_INCLUDE_SLICES=read,list` registers only read and list tools.

## CMS MCP Server Chaining

This server automatically chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), sharing the same API user credentials. All CMS tools are proxied with a `cms:` prefix (e.g. `cms:get-document`, `cms:list-media`).

This means your AI agent can work with both Engage and CMS content in a single conversation without needing to configure two separate MCP servers. Any mode, collection, and slice filter configuration is passed through to the chained server.

To disable chaining, set `DISABLE_MCP_CHAINING=true`.

## License

MIT
