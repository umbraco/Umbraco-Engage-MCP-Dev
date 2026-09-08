# CLI Workflow Patterns

Common task patterns showing efficient CLI usage. Each pattern shows the minimum number of calls needed.

## Table of Contents

- [Exploring available tools for a domain](#exploring-available-tools-for-a-domain)
- [Getting full details of an entity](#getting-full-details-of-an-entity)
- [Finding a real content page to target](#finding-a-real-content-page-to-target)
- [Building an A/B test end-to-end](#building-an-ab-test-end-to-end)
- [Filtering combinations](#filtering-combinations)

---

## Exploring available tools for a domain

When the user asks "what can I do with A/B testing?" or "show me the personalization tools":

```bash
# One call — filter to the mode
<cli> --list-tools --umbraco-tool-modes ab-testing
```

To see only read operations:
```bash
<cli> --list-tools --umbraco-tool-modes personalization --umbraco-include-slices read,list,search
```

To see what the LLM would see in readonly mode:
```bash
<cli> --list-tools --umbraco-readonly
```

## Getting full details of an entity

When you need to understand a tool's parameters before calling it:

```bash
# Describe the tool first — shows full JSON schema
<cli> --describe-tool post-ab-test

# Then call it with the right parameters
<cli> --call get-ab-test-project-all --call-args '{}'
```

This is faster than guessing parameters and handling errors — several write tools here (`post-ab-test`, `post-goal`) accept a smaller input than the raw Engage API and build the rest of the payload internally, so the schema is the source of truth, not the Management API docs.

## Finding a real content page to target

Most Engage entities (A/B tests, applied personalization) attach to a real, published Umbraco content page — a placeholder guid will not validate. Use the chained CMS tools rather than the Engage tools to find or create one:

```bash
# Search for an existing page by name
<cli> --call cms:search-document --call-args '{"query":"Home"}'

# Or create + publish a new one — see the umb-engage-content-recipes skill
# for the exact create/publish tool sequence and required fields.
```

The page's returned `id`/`key` is what Engage tools call `pageUnique`.

## Building an A/B test end-to-end

A single `post-ab-test` call needs a real page and a real goal already created. Minimum sequence:

```bash
# 1. Real published page (via chained cms: tools)
<cli> --call cms:create-document --call-args '{...}'
<cli> --call cms:publish-document --call-args '{"id":"<page-id>"}'

# 2. A real, valid goal type
<cli> --call get-goal-all-types --call-args '{}'
# → find the entry with configurationEditorAlias "CustomGoal"

# 3. A real goal
<cli> --call post-goal --call-args '{"name":"...","goalTypeId":"<goal-type-id>", ...}'

# 4. Resolve the goal's numeric id (post-ab-test needs this, not the goal's uuid)
<cli> --call get-goal-details --call-args '{"id":"<goal-unique-from-step-3>"}'

# 5. Create the test
<cli> --call post-ab-test --call-args '{"name":"...","testType":"SinglePage","goalId":<numeric-id-from-step-4>,"goal":{...},"pageUnique":"<page-id-from-step-1>", ...}'
```

See the `umb-engage-content-recipes` skill's `ab-test.md` reference for the full field-by-field breakdown and the gotchas (goal type must be real, not an all-zero placeholder; `goalId` and the embedded `goal` object must describe the same goal).

## Filtering combinations

Filters combine — use them together to get precisely the tools you need.

| Goal | Flags |
|------|-------|
| Everything for A/B testing | `--umbraco-tool-modes ab-testing` |
| Only read tools for personalization | `--umbraco-tool-modes personalization --umbraco-include-slices read,list` |
| Everything except analytics | `--umbraco-exclude-tool-collections analytics,reporting,statistics,search-terms,heatmaps` |
| Engage tools only, no CMS chaining | `--disable-mcp-chaining` |
| Readonly view of everything | `--umbraco-readonly` |

Remember: exclude takes precedence over include when both are specified.
