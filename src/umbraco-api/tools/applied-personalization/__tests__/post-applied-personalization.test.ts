import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import { AppliedPersonalizationTestHelper } from "./helpers/applied-personalization-test-helper.js";
import { getUmbracoEngageManagementAPI } from "../../../api/generated/umbracoEngageManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { normalizeVolatileFields } from "../../../../testing/normalize-volatile-fields.js";
import tool from "../post/post-applied-personalization.js";

describe("post-applied-personalization", () => {
  setupTestEnvironment();

  afterEach(async () => {
    if (createdUnique != null) {
      const client = getUmbracoEngageManagementAPI();
      try {
        await client.deleteAppliedPersonalization(
          { id: createdUnique },
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } catch {
        // ignore cleanup errors
      }
      createdUnique = undefined;
    }
  });

  let createdUnique: string | undefined;

  it("should create a new applied personalization", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await tool.handler(
      {
        name: null,
        description: null,
        type: "SinglePage",
        isActive: true,
        css: null,
        javascript: null,
        segmentId: null,
        umbracoSegmentAlias: null,
        pages: [],
        contentTypes: [],
      },
      context,
    );

    createdUnique = (result.structuredContent as { unique?: string } | undefined)?.unique;

    expect(
      normalizeVolatileFields(
        AppliedPersonalizationTestHelper.normalizeIds(
          createSnapshotResult(result),
        ),
      ),
    ).toMatchSnapshot();
  });
});
