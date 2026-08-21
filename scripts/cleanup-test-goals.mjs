#!/usr/bin/env node

/**
 * Deletes leftover test-created goals directly from the demo SQL Server
 * database, via `docker exec` into the `sql` container's bundled sqlcmd.
 *
 * WHY THIS EXISTS: the Umbraco Engage Management API has no delete-goal
 * endpoint at all (only post-goal, post-goal-all, get-goal-all-types,
 * get-goal-details), so every goal created by this repo's integration tests
 * (goal/__tests__, and the ab-test/ab-test-variant real fixture chains,
 * which each create a real goal as a dependency) accumulates permanently
 * with no API-level way to remove it.
 *
 * SAFETY: only ever targets rows in umbracoEngageSettingsGoal whose `name`
 * matches a fixed, hardcoded allow-list of prefixes used by this repo's own
 * test fixtures (see TEST_NAME_PREFIXES below) - never a caller-supplied
 * WHERE clause. Goals still referenced by a real umbracoEngageAbTestingAbTest
 * row (a NO_ACTION foreign key - the delete would fail anyway) are detected
 * and skipped/reported rather than attempted.
 *
 * Usage:
 *   node scripts/cleanup-test-goals.mjs            # dry run (default) - lists what would be deleted
 *   node scripts/cleanup-test-goals.mjs --execute   # actually deletes
 *
 * Requires: the `sql` docker container running (see demo-site/appsettings.local.json
 * for the connection details this script reads its password from), and Docker
 * available on the PATH.
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPSETTINGS_LOCAL_PATH = path.resolve(__dirname, "../demo-site/appsettings.local.json");

const DOCKER_CONTAINER = "sql";
const DATABASE = "umbraco-engage-mcp";
const GOAL_TABLE = "umbracoEngageSettingsGoal";
const AB_TEST_TABLE = "umbracoEngageAbTestingAbTest";

// Fixed allow-list of name prefixes used by this repo's own test fixtures.
// Never widen this via a CLI argument - the whole point is that this script
// can never accidentally delete a goal a human created through the backoffice.
const TEST_NAME_PREFIXES = ["_Test", "_Probe"];

const EXECUTE = process.argv.includes("--execute");

function getSqlPassword() {
  const raw = readFileSync(APPSETTINGS_LOCAL_PATH, "utf8");
  const json = JSON.parse(raw);
  const connString = json.ConnectionStrings?.umbracoDbDSN;
  if (!connString) {
    throw new Error(`Could not find ConnectionStrings.umbracoDbDSN in ${APPSETTINGS_LOCAL_PATH}`);
  }
  const match = connString.match(/password=([^;]+)/i);
  if (!match) {
    throw new Error("Could not extract password from connection string");
  }
  return match[1];
}

function runSql(query) {
  const password = getSqlPassword();
  const args = [
    "exec",
    "-i",
    DOCKER_CONTAINER,
    "/opt/mssql-tools18/bin/sqlcmd",
    "-S",
    "localhost",
    "-U",
    "sa",
    "-P",
    password,
    "-C",
    "-d",
    DATABASE,
    "-Q",
    query,
  ];
  return execFileSync("docker", args, { encoding: "utf8" });
}

function likeClause(column) {
  // SQL Server LIKE treats a leading `_` as a wildcard (any single char) -
  // bracket-escape it so we match a literal underscore.
  return TEST_NAME_PREFIXES.map((p) => `${column} LIKE '[${p[0]}]${p.slice(1)}%'`).join(" OR ");
}

console.log(`Mode: ${EXECUTE ? "EXECUTE (will delete)" : "DRY RUN (no changes)"}`);
console.log(`Matching name prefixes: ${TEST_NAME_PREFIXES.join(", ")}\n`);

const matchingOutput = runSql(`
  SELECT COUNT(*) AS matchCount FROM ${GOAL_TABLE} WHERE ${likeClause("name")}
`);
console.log("Total matching goals:");
console.log(matchingOutput);

const blockedOutput = runSql(`
  SELECT g.id, g.name FROM ${GOAL_TABLE} g
  WHERE (${likeClause("g.name")})
    AND EXISTS (SELECT 1 FROM ${AB_TEST_TABLE} t WHERE t.goalId = g.id)
`);
console.log("Matching goals still referenced by a real A/B test (will be SKIPPED - deleting these would fail on a foreign key anyway):");
console.log(blockedOutput);

if (!EXECUTE) {
  console.log("Dry run only - no rows deleted. Re-run with --execute to actually delete.");
  process.exit(0);
}

const deleteResult = runSql(`
  DELETE FROM ${GOAL_TABLE}
  WHERE (${likeClause("name")})
    AND NOT EXISTS (SELECT 1 FROM ${AB_TEST_TABLE} t WHERE t.goalId = ${GOAL_TABLE}.id);
  SELECT @@ROWCOUNT AS deletedCount;
`);
console.log("Delete result:");
console.log(deleteResult);
