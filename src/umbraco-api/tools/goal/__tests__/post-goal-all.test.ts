import { jest } from "@jest/globals";
import { setupTestEnvironment, createMockRequestHandlerExtra, GoalBuilder } from "./setup.js";
import { deleteTestGoals } from "./helpers/sql-cleanup.js";
import tool from "../post/post-goal-all.js";

jest.setTimeout(30000);

// Three known goals, alphabetically ordered by name and with distinct
// values, created against a clean slate (see beforeAll) so listing,
// pagination, ordering, and filtering can all be asserted against a
// deterministic set - not just checked for shape. This is only possible
// because deleteTestGoals() bypasses the Management API's missing
// delete-goal endpoint via a direct SQL delete (see helpers/sql-cleanup.ts) -
// unlike every other collection in this repo, these tests require the `sql`
// docker container to be running, not just the Umbraco instance.
const TEST_GOALS = [
  { name: "_Test Goal A", value: 10 },
  { name: "_Test Goal B", value: 20 },
  { name: "_Test Goal C", value: 30 },
];

describe("post-goal-all", () => {
  setupTestEnvironment();

  beforeAll(async () => {
    deleteTestGoals();

    for (const goal of TEST_GOALS) {
      await new GoalBuilder().withName(goal.name).withValue(goal.value).create();
    }
  });

  afterAll(() => {
    deleteTestGoals();
  });

  it("returns a paginated list of goals", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { page: 1, pageSize: 10, filterBy: null, orderBy: null, includeInvalid: true },
      context,
    );

    expect(result.isError).toBeFalsy();

    const content = result.structuredContent as {
      currentPage: number;
      totalPages: number;
      totalRowCount: number;
      itemsPerPage: number;
      rows: unknown[];
    };

    expect(typeof content.currentPage).toBe("number");
    expect(typeof content.totalPages).toBe("number");
    expect(typeof content.totalRowCount).toBe("number");
    expect(typeof content.itemsPerPage).toBe("number");
    expect(Array.isArray(content.rows)).toBe(true);
  });

  // Scoped by our own globally-unique name, proving filterBy genuinely
  // narrows results rather than being ignored.
  it("finds a real created goal via filterBy, proving the filter genuinely narrows results", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { page: 1, pageSize: 10, filterBy: TEST_GOALS[0].name, orderBy: null, includeInvalid: true },
      context,
    );

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as {
      totalRowCount: number;
      rows: { unique: string; name: string | null; isActive: boolean }[];
    };

    expect(content.totalRowCount).toBe(1);
    expect(content.rows).toHaveLength(1);
    expect(content.rows[0].name).toBe(TEST_GOALS[0].name);
    expect(content.rows[0].isActive).toBe(true);
  });

  // Against the clean, deterministic 3-goal baseline from beforeAll:
  // proves pagination genuinely splits results (not just returning
  // everything regardless of pageSize) and totalRowCount is exact.
  it("paginates the known 3-goal baseline correctly across pages", async () => {
    const context = createMockRequestHandlerExtra();
    const filterBy = "_Test Goal ";

    const page1 = await tool.handler(
      { page: 1, pageSize: 2, filterBy, orderBy: "name", includeInvalid: true },
      context,
    );
    expect(page1.isError).toBeFalsy();
    const page1Content = page1.structuredContent as {
      totalRowCount: number;
      totalPages: number;
      rows: { name: string | null }[];
    };
    expect(page1Content.totalRowCount).toBe(3);
    expect(page1Content.totalPages).toBe(2);
    expect(page1Content.rows).toHaveLength(2);

    const page2 = await tool.handler(
      { page: 2, pageSize: 2, filterBy, orderBy: "name", includeInvalid: true },
      context,
    );
    expect(page2.isError).toBeFalsy();
    const page2Content = page2.structuredContent as { rows: { name: string | null }[] };
    expect(page2Content.rows).toHaveLength(1);

    // Combined across both pages, all 3 known names appear exactly once.
    const allNames = [...page1Content.rows, ...page2Content.rows].map((r) => r.name);
    expect(allNames.sort()).toEqual(TEST_GOALS.map((g) => g.name).sort());
  });

  // Proves orderBy genuinely sorts (not silently ignored) against the
  // known, alphabetically-distinct baseline.
  it("orders the known 3-goal baseline by name", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      { page: 1, pageSize: 10, filterBy: "_Test Goal ", orderBy: "name", includeInvalid: true },
      context,
    );

    expect(result.isError).toBeFalsy();
    const content = result.structuredContent as { rows: { name: string | null }[] };
    expect(content.rows.map((r) => r.name)).toEqual(TEST_GOALS.map((g) => g.name));
  });
});
