import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import getGoalDetailsTool from "../../get/get-goal-details.js";
import postGoalAllTool from "../../post/post-goal-all.js";
import { deleteTestGoals } from "./sql-cleanup.js";

type GoalAllParams = Parameters<typeof postGoalAllTool.handler>[0];
type GoalRow = { unique: string; name: string | null; [key: string]: unknown };

export class GoalTestHelper {
  static async getDetails(id: string): Promise<any> {
    const context = createMockRequestHandlerExtra();
    const result = await getGoalDetailsTool.handler({ id }, context);
    if (result.isError) {
      throw new Error(`Failed to get goal details for "${id}": ${JSON.stringify(result.content)}`);
    }
    return result.structuredContent;
  }

  static async listAll(params?: Partial<GoalAllParams>): Promise<GoalRow[]> {
    const context = createMockRequestHandlerExtra();
    const result = await postGoalAllTool.handler(
      {
        page: 1,
        pageSize: 1000,
        filterBy: null,
        orderBy: null,
        includeInvalid: true,
        ...params,
      },
      context,
    );
    if (result.isError) {
      throw new Error(`Failed to list goals: ${JSON.stringify(result.content)}`);
    }
    return (result.structuredContent as { rows: GoalRow[] }).rows;
  }

  static async findByName(name: string): Promise<GoalRow | undefined> {
    const all = await this.listAll();
    return all.find((row) => row.name === name);
  }

  /**
   * There is no delete-goal endpoint in the Engage Management API - this is
   * a thin wrapper around the SQL-based sweep in `sql-cleanup.ts`, for use
   * in `beforeAll`/`afterAll` hooks. Deletes every goal whose name matches
   * the fixed `_Test`/`_Probe` prefixes, not just goals created by the
   * calling test.
   */
  static cleanup(): void {
    deleteTestGoals();
  }
}
