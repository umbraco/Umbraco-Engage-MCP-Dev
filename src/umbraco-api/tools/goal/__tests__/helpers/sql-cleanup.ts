import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPSETTINGS_LOCAL_PATH = path.resolve(__dirname, "../../../../../../demo-site/appsettings.local.json");

// Overridable for CI, where the SQL Server service container has an
// auto-generated name/database rather than the local dev container's
// fixed "sql" name and "umbraco-engage-mcp" database.
const DOCKER_CONTAINER = process.env.SQL_CONTAINER_NAME || "sql";
const DATABASE = process.env.SQL_DATABASE_NAME || "umbraco-engage-mcp";
const GOAL_TABLE = "umbracoEngageSettingsGoal";
const AB_TEST_TABLE = "umbracoEngageAbTestingAbTest";

/**
 * The Engage Management API has no delete-goal endpoint at all, so real
 * goals created by tests (here, and by the ab-test/ab-test-variant real
 * fixture chains) accumulate permanently with no API-level cleanup path.
 * This bypasses the API and deletes directly from the demo SQL Server
 * database, via `docker exec` into the `sql` container's bundled sqlcmd -
 * see scripts/cleanup-test-goals.mjs for the standalone CLI version this
 * mirrors.
 *
 * SAFETY: only ever targets rows whose `name` matches the fixed
 * `_Test`/`_Probe` prefixes used by this repo's own fixtures - never a
 * caller-supplied condition. Goals still referenced by a real A/B test row
 * (a NO_ACTION foreign key) are skipped rather than attempted, since the
 * delete would fail anyway.
 *
 * Requires the `sql` docker container to be running - this is a genuinely
 * new environment requirement specific to the goal collection's tests
 * (every other collection in this repo tests exclusively through the
 * Management API, with no direct DB access).
 */
export function deleteTestGoals(): void {
  const password = getSqlPassword();
  const query = `
    DELETE FROM ${GOAL_TABLE}
    WHERE (name LIKE '[_]Test%' OR name LIKE '[_]Probe%')
      AND NOT EXISTS (SELECT 1 FROM ${AB_TEST_TABLE} t WHERE t.goalId = ${GOAL_TABLE}.id);
  `;
  runSql(password, query);
}

function getSqlPassword(): string {
  const raw = readFileSync(APPSETTINGS_LOCAL_PATH, "utf8");
  const json = JSON.parse(raw) as { ConnectionStrings?: { umbracoDbDSN?: string } };
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

function runSql(password: string, query: string): string {
  return execFileSync(
    "docker",
    [
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
    ],
    { encoding: "utf8" },
  );
}
