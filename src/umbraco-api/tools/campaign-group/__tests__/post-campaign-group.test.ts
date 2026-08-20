import { randomUUID } from "node:crypto";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  CampaignGroupTestHelper,
} from "./setup.js";
import tool from "../post/post-campaign-group.js";
import deleteTool from "../delete/delete-campaign-group.js";

describe("post-campaign-group", () => {
  setupTestEnvironment();

  let createdId: string | undefined;

  afterEach(async () => {
    if (createdId) {
      await deleteTool.handler(
        { id: createdId },
        createMockRequestHandlerExtra(),
      );
      createdId = undefined;
    }
  });

  it("creates a new campaign group", async () => {
    const context = createMockRequestHandlerExtra();
    const TEST_UNIQUE = randomUUID();

    const result = await tool.handler(
      {
        id: 0,
        created: new Date().toISOString(),
        unique: TEST_UNIQUE,
        name: undefined,
        description: undefined,
        invalid: false,
        campaigns: [],
        customerJourneyScoring: [],
        personaScoring: [],
      },
      context,
    );

    expect(result.isError).toBeFalsy();
    createdId = (result.structuredContent as any)?.unique ?? TEST_UNIQUE;

    const normalized = {
      ...result,
      structuredContent: CampaignGroupTestHelper.normalizeIds(
        result.structuredContent,
      ),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
