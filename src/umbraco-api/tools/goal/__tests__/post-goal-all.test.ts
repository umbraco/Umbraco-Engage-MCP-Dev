import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import tool from "../post/post-goal-all.js";

const TEST_PAGE = 1;
const TEST_PAGE_SIZE = 10;

describe("post-goal-all", () => {
  setupTestEnvironment();

  // Every post-goal.test.ts run (and any future run of this test suite)
  // permanently adds new goal rows with no delete-goal endpoint to clean up,
  // so totalRowCount/rows grow across runs and can never be a stable
  // snapshot. Use plain assertions instead, same pattern as
  // document-type-permissions/__tests__/get-permissions-document-type-all.test.ts.
  it("returns a paginated list of goals", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        page: TEST_PAGE,
        pageSize: TEST_PAGE_SIZE,
        filterBy: null,
        orderBy: null,
        includeInvalid: true,
      },
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
});
